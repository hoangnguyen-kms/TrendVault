import { Router, Response } from 'express';
import { authMiddleware, type AuthRequest } from '../../middleware/auth-middleware.js';
import { successResponse, errorResponse } from '../../lib/api-response.js';
import { prisma } from '../../lib/prisma-client.js';

const router = Router();

/** GET /api/accounts — list user's connected accounts (no tokens exposed) */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await prisma.connectedAccount.findMany({
      where: { userId: req.userId! },
      select: {
        id: true,
        platform: true,
        platformUserId: true,
        displayName: true,
        avatarUrl: true,
        scopes: true,
        tokenExpiresAt: true,
        createdAt: true,
        updatedAt: true,
        channels: {
          select: {
            id: true,
            platform: true,
            platformChannelId: true,
            name: true,
            avatarUrl: true,
            subscriberCount: true,
            videoCount: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Serialize BigInt fields
    const serialized = accounts.map((a) => ({
      ...a,
      channels: a.channels.map((ch) => ({
        ...ch,
        subscriberCount: ch.subscriberCount ? Number(ch.subscriberCount) : null,
      })),
    }));

    res.json(successResponse(serialized));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch accounts';
    res.status(500).json(errorResponse(message));
  }
});

/** GET /api/accounts/:id — single account details */
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const account = await prisma.connectedAccount.findFirst({
      where: { id: req.params.id as string, userId: req.userId! },
      select: {
        id: true,
        platform: true,
        platformUserId: true,
        displayName: true,
        avatarUrl: true,
        scopes: true,
        tokenExpiresAt: true,
        createdAt: true,
        updatedAt: true,
        channels: {
          select: {
            id: true,
            platform: true,
            platformChannelId: true,
            name: true,
            avatarUrl: true,
            subscriberCount: true,
            totalViews: true,
            videoCount: true,
            isActive: true,
          },
        },
      },
    });

    if (!account) {
      res.status(404).json(errorResponse('Account not found'));
      return;
    }

    const serialized = {
      ...account,
      channels: account.channels.map((ch) => ({
        ...ch,
        subscriberCount: ch.subscriberCount ? Number(ch.subscriberCount) : null,
        totalViews: ch.totalViews ? Number(ch.totalViews) : null,
      })),
    };

    res.json(successResponse(serialized));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch account';
    res.status(500).json(errorResponse(message));
  }
});

export { router as accountsRouter };
