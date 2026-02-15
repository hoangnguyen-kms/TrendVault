import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth-middleware.js';
import { downloadLimiter } from '../../middleware/rate-limiter.js';
import { downloadController } from './download-controller.js';

const router = Router();

// POST /api/downloads — queue a single download
router.post('/', authMiddleware, downloadLimiter, downloadController.queueDownload);

// POST /api/downloads/batch — queue multiple downloads
router.post('/batch', authMiddleware, downloadLimiter, downloadController.batchQueueDownloads);

// GET /api/downloads — list user's downloads (with filters)
router.get('/', authMiddleware, downloadController.getDownloads);

// GET /api/downloads/:id — single download details
router.get('/:id', authMiddleware, downloadController.getDownloadById);

// GET /api/downloads/:id/url — get pre-signed download URL
router.get('/:id/url', authMiddleware, downloadController.getDownloadUrl);

// POST /api/downloads/:id/retry — retry failed download
router.post('/:id/retry', authMiddleware, downloadController.retryDownload);

// DELETE /api/downloads/:id — cancel/delete download
router.delete('/:id', authMiddleware, downloadController.deleteDownload);

export { router as downloadRouter };
