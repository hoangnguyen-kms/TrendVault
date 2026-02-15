import { Router } from 'express';
import type { Response } from 'express';
import { authMiddleware, type AuthRequest } from '../../middleware/auth-middleware.js';
import { successResponse, errorResponse } from '../../lib/api-response.js';
import { analyticsService } from './analytics-service.js';
import { DateRangeQuerySchema, VideoListQuerySchema, getDateRange } from './analytics-schemas.js';

const router = Router();

// GET /api/analytics/channels/:channelId/overview
router.get('/channels/:channelId/overview', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const channelId = req.params.channelId as string;
    const data = await analyticsService.getChannelOverview(channelId, req.userId!);
    res.json(successResponse(data));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get channel overview';
    res.status(message === 'Channel not found' ? 404 : 500).json(errorResponse(message));
  }
});

// GET /api/analytics/channels/:channelId/videos
router.get('/channels/:channelId/videos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const channelId = req.params.channelId as string;
    const query = VideoListQuerySchema.parse(req.query);
    const data = await analyticsService.getChannelVideos(channelId, req.userId!, query);
    res.json(successResponse(data));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get channel videos';
    res.status(message === 'Channel not found' ? 404 : 500).json(errorResponse(message));
  }
});

// GET /api/analytics/videos/:videoId/stats
router.get('/videos/:videoId/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const videoId = req.params.videoId as string;
    const parsed = DateRangeQuerySchema.parse(req.query);
    const dateRange = getDateRange(parsed.range, parsed.from, parsed.to);
    const data = await analyticsService.getVideoStats(videoId, req.userId!, dateRange);
    res.json(successResponse(data));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get video stats';
    res.status(message === 'Video not found' ? 404 : 500).json(errorResponse(message));
  }
});

// GET /api/analytics/videos/:videoId/lifecycle
router.get('/videos/:videoId/lifecycle', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const videoId = req.params.videoId as string;
    const data = await analyticsService.getContentLifecycle(videoId, req.userId!);
    res.json(successResponse(data));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get content lifecycle';
    res.status(message === 'Video not found' ? 404 : 500).json(errorResponse(message));
  }
});

// GET /api/analytics/cross-channel
router.get('/cross-channel', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await analyticsService.getCrossChannelAggregate(req.userId!);
    res.json(successResponse(data));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get cross-channel analytics';
    res.status(500).json(errorResponse(message));
  }
});

// GET /api/analytics/cross-channel/compare
router.get('/cross-channel/compare', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await analyticsService.getCrossChannelComparison(req.userId!);
    res.json(successResponse(data));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get content comparison';
    res.status(500).json(errorResponse(message));
  }
});

export { router as analyticsRouter };
