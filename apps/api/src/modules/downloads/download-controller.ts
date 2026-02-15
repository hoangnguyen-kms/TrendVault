import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../../lib/api-response.js';
import { DownloadService } from './download-service.js';
import { ConflictError } from './download-helpers.js';
import {
  QueueDownloadRequestSchema,
  BatchDownloadRequestSchema,
  GetDownloadsQuerySchema,
  GetDownloadByIdParamsSchema,
} from './download-schemas.js';
import type { AuthRequest } from '../../middleware/auth-middleware.js';

const downloadService = new DownloadService();

export const downloadController = {
  /** POST /api/downloads — queue a single download */
  async queueDownload(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = QueueDownloadRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        const details = parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json(errorResponse('Validation failed', details));
        return;
      }

      const result = await downloadService.queueDownload(req.userId!, parsed.data.trendingVideoId);
      res.status(201).json(successResponse(result));
    } catch (error) {
      if (error instanceof ConflictError) {
        res.status(409).json(errorResponse(error.message));
        return;
      }
      const message = error instanceof Error ? error.message : 'Failed to queue download';
      res.status(500).json(errorResponse(message));
    }
  },

  /** POST /api/downloads/batch — queue multiple downloads */
  async batchQueueDownloads(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = BatchDownloadRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        const details = parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json(errorResponse('Validation failed', details));
        return;
      }

      const results = await downloadService.batchQueueDownloads(
        req.userId!,
        parsed.data.trendingVideoIds,
      );
      res.status(201).json(successResponse(results));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to queue batch download';
      res.status(500).json(errorResponse(message));
    }
  },

  /** GET /api/downloads — list user's downloads with filters */
  async getDownloads(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = GetDownloadsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const details = parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json(errorResponse('Invalid query parameters', details));
        return;
      }

      const result = await downloadService.getDownloads(req.userId!, parsed.data);
      res.json(successResponse(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch downloads';
      res.status(500).json(errorResponse(message));
    }
  },

  /** GET /api/downloads/:id — single download details */
  async getDownloadById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = GetDownloadByIdParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json(errorResponse('Invalid download ID'));
        return;
      }

      const download = await downloadService.getDownloadById(req.userId!, parsed.data.id);
      res.json(successResponse(download));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Download not found';
      res.status(404).json(errorResponse(message));
    }
  },

  /** GET /api/downloads/:id/url — get pre-signed download URL */
  async getDownloadUrl(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = GetDownloadByIdParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json(errorResponse('Invalid download ID'));
        return;
      }

      const url = await downloadService.getDownloadUrl(req.userId!, parsed.data.id);
      res.json(successResponse({ url }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Download URL not available';
      res.status(404).json(errorResponse(message));
    }
  },

  /** POST /api/downloads/:id/retry — retry a failed download */
  async retryDownload(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = GetDownloadByIdParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json(errorResponse('Invalid download ID'));
        return;
      }

      const result = await downloadService.retryDownload(req.userId!, parsed.data.id);
      res.status(201).json(successResponse(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retry download';
      res.status(400).json(errorResponse(message));
    }
  },

  /** DELETE /api/downloads/:id — cancel or delete a download */
  async deleteDownload(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = GetDownloadByIdParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json(errorResponse('Invalid download ID'));
        return;
      }

      await downloadService.deleteDownload(req.userId!, parsed.data.id);
      res.json(successResponse({ deleted: true }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete download';
      res.status(400).json(errorResponse(message));
    }
  },
};
