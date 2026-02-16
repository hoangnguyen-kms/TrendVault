import { Platform } from '../../../lib/prisma-client.js';
import { env } from '../../../config/environment.js';
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

    const response = await fetch(runUrl, {
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
    });

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
    return {
      platform: Platform.TIKTOK,
      platformVideoId: item.id ?? String(item.webVideoUrl?.split('/').pop() ?? ''),
      region,
      title: item.text ?? '',
      description: item.text ?? null,
      thumbnailUrl: item.videoMeta?.coverUrl ?? null,
      channelName: item.authorMeta?.nickName ?? item.authorMeta?.name ?? null,
      channelId: item.authorMeta?.id ?? null,
      duration: item.videoMeta?.duration ?? null,
      viewCount: this.toBigInt(item.playCount),
      likeCount: this.toBigInt(item.diggCount),
      commentCount: this.toBigInt(item.commentCount),
      shareCount: this.toBigInt(item.shareCount),
      publishedAt: item.createTimeISO ? new Date(item.createTimeISO) : null,
      trendingRank: index + 1,
      category: null,
      tags: item.hashtags?.map((h) => h.name) ?? [],
      rawMetadata: null,
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
