import { google, youtube_v3 } from 'googleapis';
import { Platform } from '@prisma/client';
import { redis } from '../../../lib/redis-client.js';
import { env } from '../../../config/environment.js';
import type {
  IPlatformAdapter,
  FetchTrendingOptions,
  FetchTrendingResult,
  TrendingVideoDTO,
} from './platform-adapter.interface.js';

// YouTube category IDs that still work with mostPopular (post-July 2025)
const MOSTPOPULAR_CATEGORY_IDS = ['10', '20', '30']; // Music, Gaming, Movies

const QUOTA_REDIS_KEY = 'trending:youtube:quota:daily';
const DAILY_QUOTA_LIMIT = 5000; // reserved for trending only

export class YouTubeAdapter implements IPlatformAdapter {
  platform: Platform = Platform.YOUTUBE;
  private youtube;

  constructor() {
    this.youtube = google.youtube({ version: 'v3', auth: env.YOUTUBE_API_KEY });
  }

  async fetchTrending(options: FetchTrendingOptions): Promise<FetchTrendingResult> {
    const { region, category, maxResults = 20, pageToken } = options;

    // Use mostPopular for Music/Gaming/Movies; search.list for general
    if (category && MOSTPOPULAR_CATEGORY_IDS.includes(category)) {
      return this.fetchMostPopular(region, category, maxResults, pageToken);
    }
    return this.fetchSearchTrending(region, category, maxResults, pageToken);
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
    const response = await this.youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      chart: 'mostPopular',
      regionCode: region,
      videoCategoryId: category,
      maxResults,
      pageToken,
    });
    await this.trackQuota(1);
    return this.mapVideoListResponse(response.data, region);
  }

  private async fetchSearchTrending(
    region: string,
    category: string | undefined,
    maxResults: number,
    pageToken?: string,
  ): Promise<FetchTrendingResult> {
    // search.list costs 100 units
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const searchParams: youtube_v3.Params$Resource$Search$List = {
      part: ['snippet'],
      type: ['video'],
      order: 'viewCount',
      regionCode: region,
      publishedAfter: sevenDaysAgo,
      maxResults,
      pageToken,
    };
    if (category) searchParams.videoCategoryId = category;

    const searchResponse = await this.youtube.search.list(searchParams);
    await this.trackQuota(100);

    const videoIds = searchResponse.data.items
      ?.map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id));

    if (!videoIds?.length) {
      return { videos: [], nextPageToken: null, totalResults: 0 };
    }

    // Batch fetch full details (1 unit)
    const videosResponse = await this.youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoIds,
    });
    await this.trackQuota(1);

    return {
      ...this.mapVideoListResponse(videosResponse.data, region),
      nextPageToken: searchResponse.data.nextPageToken ?? null,
      totalResults: searchResponse.data.pageInfo?.totalResults ?? null,
    };
  }

  private mapVideoListResponse(
    data: youtube_v3.Schema$VideoListResponse,
    region: string,
  ): FetchTrendingResult {
    const videos: TrendingVideoDTO[] = (data.items ?? []).map((item, index) => ({
      platform: Platform.YOUTUBE,
      platformVideoId: item.id ?? '',
      region,
      title: item.snippet?.title ?? '',
      description: item.snippet?.description ?? null,
      thumbnailUrl:
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.default?.url ??
        null,
      channelName: item.snippet?.channelTitle ?? null,
      channelId: item.snippet?.channelId ?? null,
      duration: this.parseDuration(item.contentDetails?.duration),
      viewCount: this.toBigInt(item.statistics?.viewCount),
      likeCount: this.toBigInt(item.statistics?.likeCount),
      commentCount: this.toBigInt(item.statistics?.commentCount),
      shareCount: null, // YouTube doesn't expose share count
      publishedAt: item.snippet?.publishedAt
        ? new Date(item.snippet.publishedAt)
        : null,
      trendingRank: index + 1,
      category: item.snippet?.categoryId ?? null,
      tags: item.snippet?.tags ?? [],
      rawMetadata: null,
    }));

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
