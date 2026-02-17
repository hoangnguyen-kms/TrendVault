import { Platform } from '../../../lib/prisma-client.js';
import { env } from '../../../config/environment.js';
import { CircuitBreaker } from '../../../lib/circuit-breaker.js';
import { retryWithBackoff } from '../../../lib/retry-with-backoff.js';
import { ServiceUnavailableError } from '../../../lib/app-errors.js';
import { detectShort } from '../shorts-detection-service.js';
import type {
  IPlatformAdapter,
  FetchTrendingOptions,
  FetchTrendingResult,
  TrendingVideoDTO,
} from './platform-adapter.interface.js';

const APIFY_ACTOR_ID = 'clockworks/free-tiktok-scraper';
const APIFY_BASE_URL = 'https://api.apify.com/v2';

/**
 * TikTok adapter — Apify is PRIMARY data source.
 * TikTok Research API is optional bonus (if approved later).
 */
export class TikTokAdapter implements IPlatformAdapter {
  platform: Platform = Platform.TIKTOK;
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker('tiktok-apify-api', {
      failureThreshold: 5,
      resetTimeout: 60000,
      monitorWindow: 60000,
    });
  }

  private async callWithResilience<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await retryWithBackoff(async () => await this.circuitBreaker.execute(apiCall), {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 5000,
      });
    } catch (error) {
      throw new ServiceUnavailableError(
        `TikTok API unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async fetchTrending(options: FetchTrendingOptions): Promise<FetchTrendingResult> {
    return this.fetchFromApify(options);
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(env.APIFY_API_TOKEN);
  }

  private async fetchFromApify(options: FetchTrendingOptions): Promise<FetchTrendingResult> {
    const { region, maxResults = 20 } = options;

    if (!env.APIFY_API_TOKEN) {
      return { videos: [], nextPageToken: null, totalResults: 0 };
    }

    // Run the Apify actor synchronously (waits for completion)
    const runUrl = `${APIFY_BASE_URL}/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items`;

    const response = await this.callWithResilience(() =>
      fetch(runUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.APIFY_API_TOKEN}`,
        },
        body: JSON.stringify({
          hashtags: [],
          resultsPerPage: maxResults,
          searchQueries: [],
          shouldDownloadCovers: false,
          shouldDownloadSlideshowImages: false,
          shouldDownloadSubtitles: false,
          shouldDownloadVideos: false,
        }),
        signal: AbortSignal.timeout(30_000),
      }),
    );

    if (!response.ok) {
      throw new Error(`Apify request failed: ${response.status} ${response.statusText}`);
    }

    const items = (await response.json()) as ApifyTikTokItem[];
    const videos = items
      .slice(0, maxResults)
      .map((item, index) => this.mapApifyItem(item, region, index));

    return {
      videos,
      nextPageToken: null, // Apify doesn't support pagination tokens
      totalResults: videos.length,
    };
  }

  private mapApifyItem(item: ApifyTikTokItem, region: string, index: number): TrendingVideoDTO {
    const title = item.text ?? '';
    const duration = item.videoMeta?.duration ?? null;
    // TikTok Apify response does not expose pixel dimensions — use title/duration heuristics only
    const isShort = detectShort({ duration, thumbnailWidth: null, thumbnailHeight: null, title });

    return {
      platform: Platform.TIKTOK,
      platformVideoId: item.id ?? String(item.webVideoUrl?.split('/').pop() ?? ''),
      region,
      title,
      description: item.text ?? null,
      thumbnailUrl: item.videoMeta?.coverUrl ?? null,
      channelName: item.authorMeta?.nickName ?? item.authorMeta?.name ?? null,
      channelId: item.authorMeta?.id ?? null,
      duration,
      viewCount: this.toBigInt(item.playCount),
      likeCount: this.toBigInt(item.diggCount),
      commentCount: this.toBigInt(item.commentCount),
      shareCount: this.toBigInt(item.shareCount),
      publishedAt: item.createTimeISO ? new Date(item.createTimeISO) : null,
      trendingRank: index + 1,
      category: null,
      tags: item.hashtags?.map((h) => h.name) ?? [],
      rawMetadata: null,
      isShort,
      width: null,
      height: null,
    };
  }

  private toBigInt(value: number | string | null | undefined): bigint | null {
    if (value == null) return null;
    try {
      return BigInt(value);
    } catch {
      return null;
    }
  }
}

// --- Apify response shape (minimal typing) ---

interface ApifyTikTokItem {
  id?: string;
  text?: string;
  webVideoUrl?: string;
  createTimeISO?: string;
  playCount?: number;
  diggCount?: number;
  commentCount?: number;
  shareCount?: number;
  videoMeta?: {
    duration?: number;
    coverUrl?: string;
  };
  authorMeta?: {
    id?: string;
    name?: string;
    nickName?: string;
  };
  hashtags?: Array<{ name: string }>;
}
