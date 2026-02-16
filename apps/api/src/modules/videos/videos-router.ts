import { Router } from 'express';
import type { Response } from 'express';
import { authMiddleware, type AuthRequest } from '../../middleware/auth-middleware.js';
import { successResponse, errorResponse } from '../../lib/api-response.js';
import { prisma } from '../../lib/prisma-client.js';

const router = Router();

// GET /api/videos/:videoId
router.get('/:videoId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const videoId = req.params.videoId as string;

    const video = await prisma.publishedVideo.findFirst({
      where: {
        id: videoId,
        channel: { connectedAccount: { userId: req.userId! } },
      },
      include: {
        channel: {
          select: { id: true, name: true, platform: true, avatarUrl: true },
        },
      },
    });

    if (!video) {
      res.status(404).json(errorResponse('Video not found'));
      return;
    }

    res.json(
      successResponse({
        ...video,
        viewCount: Number(video.viewCount ?? 0),
        likeCount: Number(video.likeCount ?? 0),
        commentCount: Number(video.commentCount ?? 0),
        shareCount: Number(video.shareCount ?? 0),
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get video';
    res.status(500).json(errorResponse(message));
  }
});

export { router as videosRouter };
