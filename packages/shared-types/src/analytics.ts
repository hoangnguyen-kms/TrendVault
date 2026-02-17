import { z } from 'zod';
import { PlatformSchema } from './platform.js';

// --- Video stats snapshot ---

export const VideoStatsSnapshotSchema = z.object({
  id: z.string().uuid(),
  publishedVideoId: z.string().uuid(),
  viewCount: z.number(),
  likeCount: z.number(),
  commentCount: z.number(),
  shareCount: z.number(),
  engagementRate: z.number().nullable(),
  isWeeklySummary: z.boolean(),
  snapshotAt: z.string(),
  createdAt: z.string(),
});

export type VideoStatsSnapshot = z.infer<typeof VideoStatsSnapshotSchema>;

// --- Stats time-series data ---

export const StatsTimeSeriesSchema = z.object({
  labels: z.array(z.string()),
  views: z.array(z.number()),
  likes: z.array(z.number()),
  comments: z.array(z.number()),
  shares: z.array(z.number()),
  engagementRates: z.array(z.number().nullable()),
});

export type StatsTimeSeries = z.infer<typeof StatsTimeSeriesSchema>;

// --- Channel overview stats ---

export const ChannelOverviewSchema = z.object({
  channelId: z.string().uuid(),
  channelName: z.string(),
  platform: PlatformSchema,
  subscriberCount: z.number().nullable(),
  totalViews: z.number().nullable(),
  totalVideos: z.number().int().nullable(),
  totalLikes: z.number(),
  totalComments: z.number(),
  avgEngagementRate: z.number().nullable(),
  recentVideos: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      thumbnailUrl: z.string().nullable(),
      viewCount: z.number(),
      likeCount: z.number(),
      publishedAt: z.string().nullable(),
      isShort: z.boolean().default(false),
    }),
  ),
});

export type ChannelOverview = z.infer<typeof ChannelOverviewSchema>;

// --- Cross-channel aggregate ---

export const CrossChannelAggregateSchema = z.object({
  totalChannels: z.number().int(),
  totalVideos: z.number().int(),
  totalViews: z.number(),
  totalLikes: z.number(),
  totalComments: z.number(),
  platformBreakdown: z.array(
    z.object({
      platform: PlatformSchema,
      channels: z.number().int(),
      videos: z.number().int(),
      views: z.number(),
      likes: z.number(),
    }),
  ),
});

export type CrossChannelAggregate = z.infer<typeof CrossChannelAggregateSchema>;

// --- Content comparison ---

export const ContentComparisonSchema = z.object({
  sourceTitle: z.string(),
  sourcePlatform: PlatformSchema,
  publishedVersions: z.array(
    z.object({
      publishedVideoId: z.string().uuid(),
      channelName: z.string(),
      platform: PlatformSchema,
      viewCount: z.number(),
      likeCount: z.number(),
      commentCount: z.number(),
    }),
  ),
});

export type ContentComparison = z.infer<typeof ContentComparisonSchema>;

// --- Content lifecycle ---

export const ContentLifecycleSchema = z.object({
  trending: z
    .object({
      id: z.string().uuid(),
      platform: PlatformSchema,
      title: z.string(),
      viewCount: z.number().nullable(),
      region: z.string(),
      fetchedAt: z.string(),
    })
    .nullable(),
  download: z
    .object({
      id: z.string().uuid(),
      status: z.string(),
      downloadedAt: z.string().nullable(),
    })
    .nullable(),
  upload: z
    .object({
      id: z.string().uuid(),
      status: z.string(),
      uploadedAt: z.string().nullable(),
    })
    .nullable(),
  published: z.object({
    id: z.string().uuid(),
    platform: PlatformSchema,
    platformVideoId: z.string(),
    title: z.string(),
    viewCount: z.number().nullable(),
    likeCount: z.number().nullable(),
    publishedAt: z.string().nullable(),
  }),
});

export type ContentLifecycle = z.infer<typeof ContentLifecycleSchema>;

// --- Query params ---

export const AnalyticsDateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  range: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
});

export type AnalyticsDateRange = z.infer<typeof AnalyticsDateRangeSchema>;

export const VideoLibraryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().optional(),
  sortBy: z
    .enum(['publishedAt', 'viewCount', 'likeCount', 'title', 'duration'])
    .default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type VideoLibraryQuery = z.infer<typeof VideoLibraryQuerySchema>;
