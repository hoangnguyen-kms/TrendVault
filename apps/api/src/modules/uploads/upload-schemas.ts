import { z } from 'zod';

export const CreateUploadRequestSchema = z.object({
  downloadedVideoId: z.string().uuid(),
  channelId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(5000).nullable().optional(),
  tags: z.array(z.string().max(50)).max(30).default([]),
  privacyStatus: z.enum(['public', 'private', 'unlisted']).default('private'),
  uploadMode: z.enum(['direct_post', 'inbox']).nullable().optional(),
});

export const GetUploadsQuerySchema = z.object({
  platform: z.enum(['ALL', 'YOUTUBE', 'TIKTOK']).default('ALL'),
  status: z
    .enum(['ALL', 'PENDING', 'UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'])
    .default('ALL'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(['createdAt', 'uploadedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const UploadIdParamsSchema = z.object({
  id: z.string().uuid(),
});
