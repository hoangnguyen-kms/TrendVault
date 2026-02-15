import { z } from 'zod';
import {
  QueueDownloadRequestSchema,
  BatchDownloadRequestSchema,
  DownloadQuerySchema,
} from '@trendvault/shared-types';

// Re-export shared schemas for backend use
export { QueueDownloadRequestSchema, BatchDownloadRequestSchema };

// Backend-specific query schema with region refinements
export const GetDownloadsQuerySchema = DownloadQuerySchema;

export const GetDownloadByIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetDownloadsQuery = z.infer<typeof GetDownloadsQuerySchema>;
export type GetDownloadByIdParams = z.infer<typeof GetDownloadByIdParamsSchema>;
