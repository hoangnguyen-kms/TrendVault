import { Router, Response } from 'express';
import { authMiddleware, type AuthRequest } from '../../middleware/auth-middleware.js';
import { successResponse, errorResponse } from '../../lib/api-response.js';
import { prisma } from '../../lib/prisma-client.js';

const router = Router();

/** Serialize BigInt fields in channel records */
function serializeChannel(ch: Record<string, unknown>) {
  return {
    ...ch,
    subscriberCount: ch.subscriberCount ? Number(ch.subscriberCount) : null,
    totalViews: ch.totalViews ? Number(ch.totalViews) : null,
  };
}

/** GET /api/channels — list all channels for the user's connected accounts */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const channels = await prisma.channel.findMany({
      where: { connectedAccount: { userId: req.userId! } },
      include: {
        connectedAccount: {
          select: { id: true, platform: true, displayName: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(successResponse(channels.map(serializeChannel)));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch channels';
    res.status(500).json(errorResponse(message));
  }
});

/** GET /api/channels/:id — single channel details */
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const channel = await prisma.channel.findFirst({
      where: { id: req.params.id as string, connectedAccount: { userId: req.userId! } },
      include: {
        connectedAccount: {
          select: { id: true, platform: true, displayName: true },
        },
      },
    });

    if (!channel) {
      res.status(404).json(errorResponse('Channel not found'));
      return;
    }

    res.json(successResponse(serializeChannel(channel as unknown as Record<string, unknown>)));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch channel';
    res.status(500).json(errorResponse(message));
  }
});

export { router as channelsRouter };
