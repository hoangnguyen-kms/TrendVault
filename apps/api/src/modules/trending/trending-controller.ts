import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../../lib/api-response.js';
import { trendingService } from './trending-service-instance.js';
import { GetTrendingQuerySchema, GetTrendingByIdParamsSchema } from './trending-schemas.js';
import { SUPPORTED_REGIONS, YOUTUBE_CATEGORIES } from '@trendvault/shared-types';

export const trendingController = {
  async getTrending(req: Request, res: Response): Promise<void> {
    try {
      const parsed = GetTrendingQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const details = parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json(errorResponse('Invalid query parameters', details));
        return;
      }

      const result = await trendingService.getTrending(parsed.data);
      res.json(successResponse(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trending videos';
      res.status(500).json(errorResponse(message));
    }
  },

  async getTrendingVideoById(req: Request, res: Response): Promise<void> {
    try {
      const parsed = GetTrendingByIdParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json(errorResponse('Invalid video ID'));
        return;
      }

      const video = await trendingService.getTrendingVideoById(parsed.data.id);
      if (!video) {
        res.status(404).json(errorResponse('Trending video not found'));
        return;
      }

      res.json(successResponse(video));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch video';
      res.status(500).json(errorResponse(message));
    }
  },

  getSupportedRegions(_req: Request, res: Response): void {
    res.json(successResponse({ regions: SUPPORTED_REGIONS, categories: YOUTUBE_CATEGORIES }));
  },
};
