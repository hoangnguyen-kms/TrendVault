import { z } from 'zod';
import { PlatformSchema } from './platform.js';

// --- Query params ---

export const TrendingQuerySchema = z.object({
  platform: z.enum(['ALL', 'YOUTUBE', 'TIKTOK']).default('ALL'),
  region: z.string().min(2).max(5).default('US'),
  category: z.string().nullish(),
  contentType: z.enum(['all', 'shorts', 'regular']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type TrendingQuery = z.infer<typeof TrendingQuerySchema>;

// --- Trending video DTO ---

export const TrendingVideoSchema = z.object({
  id: z.string().uuid().optional(),
  platform: PlatformSchema,
  platformVideoId: z.string(),
  region: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  channelName: z.string().nullable(),
  channelId: z.string().nullable(),
  duration: z.number().int().nullable(),
  viewCount: z.coerce.number().nullable(),
  likeCount: z.coerce.number().nullable(),
  commentCount: z.coerce.number().nullable(),
  shareCount: z.coerce.number().nullable(),
  publishedAt: z.string().nullable(),
  trendingRank: z.number().int().nullable(),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  isShort: z.boolean().default(false),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  aspectRatio: z.number().nullable().optional(),
  fetchedAt: z.string(),
});

export type TrendingVideo = z.infer<typeof TrendingVideoSchema>;

// --- Paginated response ---

export const PaginatedTrendingResponseSchema = z.object({
  data: z.array(TrendingVideoSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  hasMore: z.boolean(),
});

export type PaginatedTrendingResponse = z.infer<typeof PaginatedTrendingResponseSchema>;

// --- Supported regions ---

export const SUPPORTED_REGIONS = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'VN', name: 'Vietnam' },
] as const;

export const SUPPORTED_REGION_CODES = SUPPORTED_REGIONS.map((r) => r.code);

// --- YouTube categories ---

export const YOUTUBE_CATEGORIES = [
  { id: '1', name: 'Film & Animation' },
  { id: '10', name: 'Music' },
  { id: '17', name: 'Sports' },
  { id: '20', name: 'Gaming' },
  { id: '22', name: 'People & Blogs' },
  { id: '23', name: 'Comedy' },
  { id: '24', name: 'Entertainment' },
  { id: '25', name: 'News & Politics' },
  { id: '26', name: 'Howto & Style' },
  { id: '27', name: 'Education' },
  { id: '28', name: 'Science & Technology' },
  { id: '30', name: 'Movies' },
] as const;
