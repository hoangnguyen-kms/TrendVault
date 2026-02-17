import { google, youtube_v3 } from 'googleapis';
import { Platform } from '../../../lib/prisma-client.js';
import { redis } from '../../../lib/redis-client.js';
import { env } from '../../../config/environment.js';
import { YOUTUBE_CATEGORIES } from '@trendvault/shared-types';
import { CircuitBreaker } from '../../../lib/circuit-breaker.js';
import { retryWithBackoff } from '../../../lib/retry-with-backoff.js';
import { ServiceUnavailableError } from '../../../lib/app-errors.js';
import { detectShort, computeAspectRatio } from '../shorts-detection-service.js';
import type {
  IPlatformAdapter,
  FetchTrendingOptions,
  FetchTrendingResult,
  TrendingVideoDTO,
} from './platform-adapter.interface.js';

const ALL_CATEGORY_IDS = YOUTUBE_CATEGORIES.map((c) => c.id);

const QUOTA_REDIS_KEY = 'trending:youtube:quota:daily';
const DAILY_QUOTA_LIMIT = 5000; // reserved for trending only

export class YouTubeAdapter implements IPlatformAdapter {
  platform: Platform = Platform.YOUTUBE;
  private youtube;
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.youtube = google.youtube({ version: 'v3', auth: env.YOUTUBE_API_KEY });
    this.circuitBreaker = new CircuitBreaker('youtube-api', {
      failureThreshold: 5,
      resetTimeout: 60000,
      monitorWindow: 60000,
    });
  }

  /**
   * Wraps YouTube API calls with circuit breaker and retry logic.
   */
  private async callWithResilience<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await retryWithBackoff(async () => await this.circuitBreaker.execute(apiCall), {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 5000,
      });
    } catch (error) {
      throw new ServiceUnavailableError(
        `YouTube API unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async fetchTrending(options: FetchTrendingOptions): Promise<FetchTrendingResult> {
    const { region, category, maxResults = 20, pageToken } = options;

    // Single category → direct mostPopular call
    if (category) {
      return this.fetchMostPopular(region, category, maxResults, pageToken);
    }

    // No category → fetch from all categories in parallel, merge by viewCount
    return this.fetchMultiCategoryTrending(region, maxResults);
  }

  async isAvailable(): Promise<boolean> {
    if (!env.YOUTUBE_API_KEY) return false;
    const used = await this.getQuotaUsed();
    return used < DAILY_QUOTA_LIMIT;
  }

  // --- Private methods ---

  private async fetchMostPopular(
    region: string,
    category: string,
    maxResults: number,
    pageToken?: string,
  ): Promise<FetchTrendingResult> {
    const response = await this.callWithResilience(() =>
      this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        chart: 'mostPopular',
        regionCode: region,
        videoCategoryId: category,
        maxResults,
        pageToken,
      }),
    );
    await this.trackQuota(1);
    return this.mapVideoListResponse(response.data, region);
  }

  /**
   * Fetch mostPopular from all categories in parallel, merge & deduplicate.
   * Each call costs 1 quota unit (vs 101 for search.list).
   */
  private async fetchMultiCategoryTrending(
    region: string,
    maxResults: number,
  ): Promise<FetchTrendingResult> {
    // Fetch a subset per category so we get variety without over-fetching
    const perCategory = Math.max(3, Math.ceil(maxResults / ALL_CATEGORY_IDS.length));

    const results = await Promise.allSettled(
      ALL_CATEGORY_IDS.map((catId) => this.fetchMostPopular(region, catId, perCategory)),
    );

    // Merge all fulfilled results and deduplicate by platformVideoId
    const seen = new Set<string>();
    const allVideos: TrendingVideoDTO[] = [];

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      for (const video of result.value.videos) {
        if (!seen.has(video.platformVideoId)) {
          seen.add(video.platformVideoId);
          allVideos.push(video);
        }
      }
    }

    // Sort by viewCount descending, reassign trendingRank
    allVideos.sort((a, b) => Number(b.viewCount ?? 0n) - Number(a.viewCount ?? 0n));
    allVideos.forEach((v, i) => {
      v.trendingRank = i + 1;
    });

    return {
      videos: allVideos.slice(0, maxResults),
      nextPageToken: null,
      totalResults: allVideos.length,
    };
  }

  private mapVideoListResponse(
    data: youtube_v3.Schema$VideoListResponse,
    region: string,
  ): FetchTrendingResult {
    const videos: TrendingVideoDTO[] = (data.items ?? []).map((item, index) => {
      const title = item.snippet?.title ?? '';
      const duration = this.parseDuration(item.contentDetails?.duration);
      const thumbnailWidth = item.snippet?.thumbnails?.high?.width ?? null;
      const thumbnailHeight = item.snippet?.thumbnails?.high?.height ?? null;
      const isShort = detectShort({ duration, thumbnailWidth, thumbnailHeight, title });

      return {
        platform: Platform.YOUTUBE,
        platformVideoId: item.id ?? '',
        region,
        title,
        description: item.snippet?.description ?? null,
        thumbnailUrl:
          item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.default?.url ?? null,
        channelName: item.snippet?.channelTitle ?? null,
        channelId: item.snippet?.channelId ?? null,
        duration,
        viewCount: this.toBigInt(item.statistics?.viewCount),
        likeCount: this.toBigInt(item.statistics?.likeCount),
        commentCount: this.toBigInt(item.statistics?.commentCount),
        shareCount: null, // YouTube doesn't expose share count
        publishedAt: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : null,
        trendingRank: index + 1,
        category: item.snippet?.categoryId ?? null,
        tags: item.snippet?.tags ?? [],
        rawMetadata: null,
        isShort,
        width: thumbnailWidth,
        height: thumbnailHeight,
      };
    });

    return {
      videos,
      nextPageToken: data.nextPageToken ?? null,
      totalResults: data.pageInfo?.totalResults ?? null,
    };
  }

  /** Parse ISO 8601 duration (PT1H2M3S) to seconds */
  private parseDuration(duration: string | null | undefined): number | null {
    if (!duration) return null;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return null;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  }

  private toBigInt(value: string | null | undefined): bigint | null {
    if (!value) return null;
    try {
      return BigInt(value);
    } catch {
      return null;
    }
  }

  private async trackQuota(units: number): Promise<void> {
    try {
      const now = new Date();
      const ttl = this.secondsUntilMidnightPT(now);
      await redis.incrby(QUOTA_REDIS_KEY, units);
      await redis.expire(QUOTA_REDIS_KEY, ttl);
    } catch {
      // Non-critical — don't fail fetches on quota tracking errors
    }
  }

  private async getQuotaUsed(): Promise<number> {
    try {
      const val = await redis.get(QUOTA_REDIS_KEY);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }

  /** YouTube quota resets at midnight Pacific Time */
  private secondsUntilMidnightPT(now: Date): number {
    const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const midnight = new Date(pt);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    return Math.ceil((midnight.getTime() - pt.getTime()) / 1000);
  }
}
