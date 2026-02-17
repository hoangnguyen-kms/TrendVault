import { z } from 'zod';
import { PlatformSchema } from './platform.js';

// --- Upload status ---

export const UploadStatusSchema = z.enum([
  'PENDING',
  'UPLOADING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);
export type UploadStatus = z.infer<typeof UploadStatusSchema>;

// --- Upload job DTO ---

export const UploadJobSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  downloadedVideoId: z.string().uuid(),
  channelId: z.string().uuid(),
  platform: PlatformSchema,
  title: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  privacyStatus: z.string(),
  uploadMode: z.string().nullable(),
  uploadAsShort: z.boolean().default(false),
  categoryId: z.string().nullable().optional(),
  status: UploadStatusSchema,
  bullmqJobId: z.string().nullable(),
  platformVideoId: z.string().nullable(),
  publishUrl: z.string().nullable(),
  progress: z.number().int().min(0).max(100),
  errorMessage: z.string().nullable(),
  uploadedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UploadJob = z.infer<typeof UploadJobSchema>;

// --- Request schemas ---

export const CreateUploadRequestSchema = z.object({
  downloadedVideoId: z.string().uuid(),
  channelId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(5000).nullable().optional(),
  tags: z.array(z.string().max(50)).max(30).default([]),
  privacyStatus: z.enum(['public', 'private', 'unlisted']).default('private'),
  uploadMode: z.enum(['direct_post', 'inbox']).nullable().optional(),
  uploadAsShort: z.boolean().default(false),
  categoryId: z.string().nullable().optional(),
});

export type CreateUploadRequest = z.infer<typeof CreateUploadRequestSchema>;

// --- Query params ---

export const UploadQuerySchema = z.object({
  platform: z.enum(['ALL', 'YOUTUBE', 'TIKTOK']).default('ALL'),
  status: z
    .enum(['ALL', 'PENDING', 'UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'])
    .default('ALL'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(['createdAt', 'uploadedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type UploadQuery = z.infer<typeof UploadQuerySchema>;

// --- Paginated response ---

export const PaginatedUploadsResponseSchema = z.object({
  data: z.array(UploadJobSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  hasMore: z.boolean(),
});

export type PaginatedUploadsResponse = z.infer<typeof PaginatedUploadsResponseSchema>;

// --- Published video DTO ---

export const PublishedVideoSchema = z.object({
  id: z.string().uuid(),
  channelId: z.string().uuid(),
  uploadJobId: z.string().uuid().nullable(),
  platform: PlatformSchema,
  platformVideoId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  privacyStatus: z.string().nullable(),
  duration: z.number().int().nullable(),
  isShort: z.boolean().default(false),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PublishedVideo = z.infer<typeof PublishedVideoSchema>;

// --- Socket.IO upload progress event ---

export interface UploadProgressEvent {
  jobId: string;
  uploadJobId: string;
  percent: number;
  phase: 'uploading' | 'processing' | 'completed';
}

// --- YouTube quota ---

export interface YouTubeQuotaInfo {
  used: number;
  limit: number;
  uploadsToday: number;
  maxUploadsPerDay: number;
  remainingUploads: number;
}
