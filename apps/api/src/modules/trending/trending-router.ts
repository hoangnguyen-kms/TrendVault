import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth-middleware.js';
import { trendingLimiter } from '../../middleware/rate-limiter.js';
import { trendingController } from './trending-controller.js';

const router = Router();

/**
 * @openapi
 * /trending/regions:
 *   get:
 *     tags: [Trending]
 *     summary: Get supported regions and YouTube categories
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of supported regions and categories
 *       401:
 *         description: Authentication required
 */
router.get('/regions', authMiddleware, trendingController.getSupportedRegions);

/**
 * @openapi
 * /trending:
 *   get:
 *     tags: [Trending]
 *     summary: List trending videos
 *     description: Rate limited to 30 requests per minute
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [YOUTUBE, TIKTOK]
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of trending videos
 *       401:
 *         description: Authentication required
 */
router.get('/', authMiddleware, trendingLimiter, trendingController.getTrending);

/**
 * @openapi
 * /trending/{id}:
 *   get:
 *     tags: [Trending]
 *     summary: Get trending video by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trending video details
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Video not found
 */
router.get('/:id', authMiddleware, trendingController.getTrendingVideoById);

export { router as trendingRouter };
