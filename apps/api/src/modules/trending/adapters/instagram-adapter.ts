import { Platform } from '../../../lib/prisma-client.js';
import { env } from '../../../config/environment.js';
import { CircuitBreaker } from '../../../lib/circuit-breaker.js';
import { retryWithBackoff } from '../../../lib/retry-with-backoff.js';
import { ServiceUnavailableError } from '../../../lib/app-errors.js';
import type {
  IPlatformAdapter,
  FetchTrendingOptions,
  FetchTrendingResult,
  TrendingVideoDTO,
} from './platform-adapter.interface.js';

// Default actor; override via env var if the actor ID changes
const APIFY_ACTOR_ID = process.env['APIFY_INSTAGRAM_ACTOR_ID'] ?? 'apify/instagram-reel-scraper';
const APIFY_BASE_URL = 'https://api.apify.com/v2';

/**
 * Instagram adapter — Apify is the only viable source.
 * Instagram has no official trending API. All Reels are treated as short-form (isShort: true).
 */
export class InstagramAdapter implements IPlatformAdapter {
  platform: Platform = Platform.INSTAGRAM;
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker('instagram-apify-api', {
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
        `Instagram API unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

    const runUrl = `${APIFY_BASE_URL}/acts/${encodeURIComponent(APIFY_ACTOR_ID)}/run-sync-get-dataset-items`;

    const response = await this.callWithResilience(() =>
      fetch(runUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.APIFY_API_TOKEN}`,
        },
        body: JSON.stringify({
          resultsLimit: maxResults,
          scrapeType: 'reels',
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
        }),
        signal: AbortSignal.timeout(30_000),
      }),
    );

    if (!response.ok) {
      throw new Error(`Apify request failed: ${response.status} ${response.statusText}`);
    }

    const items = (await response.json()) as ApifyInstagramItem[];
    const videos = items
      .slice(0, maxResults)
      .map((item, index) => this.mapApifyItem(item, region, index));

    return {
      videos,
      nextPageToken: null, // Apify does not support pagination tokens
      totalResults: videos.length,
    };
  }

  private mapApifyItem(item: ApifyInstagramItem, region: string, index: number): TrendingVideoDTO {
    // Use shortCode as the stable video identifier; fall back to id
    const platformVideoId = item.shortCode ?? item.id ?? String(index);
    const caption = item.caption ?? '';
    // Truncate caption to a reasonable title length (first line or 100 chars)
    const firstLine = caption.split('\n')[0] ?? '';
    const title = firstLine.length > 0 ? firstLine.slice(0, 100) : platformVideoId;

    return {
      platform: Platform.INSTAGRAM,
      platformVideoId,
      region,
      title,
      description: caption || null,
      thumbnailUrl: item.displayUrl ?? null,
      channelName: item.ownerUsername ?? null,
      channelId: item.ownerId ?? null,
      // Instagram Reels duration in seconds; default null if missing
      duration: item.videoDuration ?? null,
      viewCount: this.toBigInt(item.videoPlayCount),
      likeCount: this.toBigInt(item.likesCount),
      commentCount: this.toBigInt(item.commentsCount),
      shareCount: null, // Instagram does not expose share counts
      publishedAt: item.timestamp ? new Date(item.timestamp) : null,
      trendingRank: index + 1,
      category: null,
      tags: item.hashtags ?? [],
      rawMetadata: null,
      // All Instagram Reels are short-form content
      isShort: true,
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

interface ApifyInstagramItem {
  id?: string;
  shortCode?: string;
  caption?: string;
  displayUrl?: string;
  ownerUsername?: string;
  ownerId?: string;
  videoDuration?: number;
  videoPlayCount?: number;
  likesCount?: number;
  commentsCount?: number;
  timestamp?: string;
  hashtags?: string[];
}
