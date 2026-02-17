import { z } from 'zod';
import { PlatformSchema } from './platform.js';

// --- Download status ---

export const DownloadStatusSchema = z.enum([
  'PENDING',
  'DOWNLOADING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);
export type DownloadStatus = z.infer<typeof DownloadStatusSchema>;

// --- Downloaded video DTO ---

export const DownloadedVideoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  trendingVideoId: z.string().uuid(),
  platform: PlatformSchema,
  platformVideoId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  duration: z.number().int().nullable(),
  status: DownloadStatusSchema,
  bullmqJobId: z.string().nullable(),
  storageKey: z.string().nullable(),
  fileSize: z.number().nullable(),
  mimeType: z.string().nullable(),
  resolution: z.string().nullable(),
  progress: z.number().int().min(0).max(100),
  isShort: z.boolean().default(false),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  aspectRatio: z.number().nullable().optional(),
  errorMessage: z.string().nullable(),
  downloadedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DownloadedVideo = z.infer<typeof DownloadedVideoSchema>;

// --- Request schemas ---

export const QueueDownloadRequestSchema = z.object({
  trendingVideoId: z.string().uuid(),
});
export type QueueDownloadRequest = z.infer<typeof QueueDownloadRequestSchema>;

export const BatchDownloadRequestSchema = z.object({
  trendingVideoIds: z.array(z.string().uuid()).min(1).max(20),
});
export type BatchDownloadRequest = z.infer<typeof BatchDownloadRequestSchema>;

// --- Query params ---

export const DownloadQuerySchema = z.object({
  platform: z.enum(['ALL', 'YOUTUBE', 'TIKTOK']).default('ALL'),
  status: z
    .enum(['ALL', 'PENDING', 'DOWNLOADING', 'COMPLETED', 'FAILED', 'CANCELLED'])
    .default('ALL'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(['createdAt', 'fileSize', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type DownloadQuery = z.infer<typeof DownloadQuerySchema>;

// --- Paginated response ---

export const PaginatedDownloadsResponseSchema = z.object({
  data: z.array(DownloadedVideoSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  hasMore: z.boolean(),
});
export type PaginatedDownloadsResponse = z.infer<typeof PaginatedDownloadsResponseSchema>;

// --- Socket.IO progress event ---

export interface DownloadProgressEvent {
  jobId: string;
  downloadedVideoId: string;
  percent: number;
  speed: string;
  eta: string;
  phase: 'downloading' | 'uploading' | 'finalizing' | 'completed';
}
