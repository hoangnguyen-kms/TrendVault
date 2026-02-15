import { Router, Response } from 'express';
import { authMiddleware, type AuthRequest } from '../../middleware/auth-middleware.js';
import { uploadLimiter } from '../../middleware/rate-limiter.js';
import { successResponse, errorResponse } from '../../lib/api-response.js';
import { uploadService } from './upload-service.js';
import {
  CreateUploadRequestSchema,
  GetUploadsQuerySchema,
  UploadIdParamsSchema,
} from './upload-schemas.js';

const router = Router();

/** POST /api/uploads — create an upload job */
router.post('/', authMiddleware, uploadLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = CreateUploadRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      res.status(400).json(errorResponse('Validation failed', details));
      return;
    }

    const result = await uploadService.createUpload(req.userId!, parsed.data);
    res.status(201).json(successResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create upload';
    res.status(400).json(errorResponse(message));
  }
});

/** GET /api/uploads — list user's uploads */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = GetUploadsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json(errorResponse('Invalid query parameters'));
      return;
    }

    const result = await uploadService.getUploads(req.userId!, parsed.data);
    res.json(successResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch uploads';
    res.status(500).json(errorResponse(message));
  }
});

/** GET /api/uploads/quota — YouTube quota usage */
router.get('/quota', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const quota = await uploadService.getYouTubeQuota(req.userId!);
    res.json(successResponse(quota));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch quota';
    res.status(500).json(errorResponse(message));
  }
});

/** GET /api/uploads/:id — single upload details */
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = UploadIdParamsSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json(errorResponse('Invalid upload ID'));
      return;
    }

    const upload = await uploadService.getUploadById(req.userId!, parsed.data.id);
    res.json(successResponse(upload));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload not found';
    res.status(404).json(errorResponse(message));
  }
});

/** POST /api/uploads/:id/retry — retry failed upload */
router.post('/:id/retry', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = UploadIdParamsSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json(errorResponse('Invalid upload ID'));
      return;
    }

    const result = await uploadService.retryUpload(req.userId!, parsed.data.id);
    res.status(201).json(successResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retry upload';
    res.status(400).json(errorResponse(message));
  }
});

/** DELETE /api/uploads/:id — cancel upload */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = UploadIdParamsSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json(errorResponse('Invalid upload ID'));
      return;
    }

    await uploadService.cancelUpload(req.userId!, parsed.data.id);
    res.json(successResponse({ cancelled: true }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel upload';
    res.status(400).json(errorResponse(message));
  }
});

export { router as uploadRouter };
