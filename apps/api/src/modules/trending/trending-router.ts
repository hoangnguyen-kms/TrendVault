import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth-middleware.js';
import { trendingLimiter } from '../../middleware/rate-limiter.js';
import { trendingController } from './trending-controller.js';

const router = Router();

// GET /api/trending/regions — supported regions + YouTube categories (must be before /:id)
router.get('/regions', authMiddleware, trendingController.getSupportedRegions);

// GET /api/trending — list trending videos (rate limited: 30 req/min)
router.get('/', authMiddleware, trendingLimiter, trendingController.getTrending);

// GET /api/trending/:id — single trending video details
router.get('/:id', authMiddleware, trendingController.getTrendingVideoById);

export { router as trendingRouter };
