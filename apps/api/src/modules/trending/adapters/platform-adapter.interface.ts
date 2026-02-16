import { Platform } from '../../../lib/prisma-client.js';

export interface TrendingVideoDTO {
  platform: Platform;
  platformVideoId: string;
  region: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  channelName: string | null;
  channelId: string | null;
  duration: number | null;
  viewCount: bigint | null;
  likeCount: bigint | null;
  commentCount: bigint | null;
  shareCount: bigint | null;
  publishedAt: Date | null;
  trendingRank: number | null;
  category: string | null;
  tags: string[];
  rawMetadata: Record<string, unknown> | null;
}

export interface FetchTrendingOptions {
  region: string;
  category?: string;
  maxResults?: number;
  pageToken?: string;
}

export interface FetchTrendingResult {
  videos: TrendingVideoDTO[];
  nextPageToken: string | null;
  totalResults: number | null;
}

export interface IPlatformAdapter {
  platform: Platform;
  fetchTrending(options: FetchTrendingOptions): Promise<FetchTrendingResult>;
  isAvailable(): Promise<boolean>;
}
