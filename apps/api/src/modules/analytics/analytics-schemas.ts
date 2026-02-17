import { z } from 'zod';

export const DateRangeQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  range: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
});

export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;

export const VideoListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().optional(),
  sortBy: z
    .enum(['publishedAt', 'viewCount', 'likeCount', 'title', 'duration'])
    .default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type VideoListQuery = z.infer<typeof VideoListQuerySchema>;

export const ShortsBreakdownSchema = z.object({
  shorts: z.object({
    count: z.number(),
    avgViews: z.number().nullable(),
    avgLikes: z.number().nullable(),
  }),
  regular: z.object({
    count: z.number(),
    avgViews: z.number().nullable(),
    avgLikes: z.number().nullable(),
  }),
});
export type ShortsBreakdown = z.infer<typeof ShortsBreakdownSchema>;

export function getDateRange(range: string, from?: string, to?: string): { from: Date; to: Date } {
  if (from && to) return { from: new Date(from), to: new Date(to) };
  const toDate = new Date();
  const fromDate = new Date();
  switch (range) {
    case '7d':
      fromDate.setDate(fromDate.getDate() - 7);
      break;
    case '30d':
      fromDate.setDate(fromDate.getDate() - 30);
      break;
    case '90d':
      fromDate.setDate(fromDate.getDate() - 90);
      break;
    case '1y':
      fromDate.setFullYear(fromDate.getFullYear() - 1);
      break;
  }
  return { from: fromDate, to: toDate };
}
