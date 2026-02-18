import { Router, Response, Request } from 'express';
import crypto from 'crypto';
import { env } from '../../config/environment.js';
import { authMiddleware, type AuthRequest } from '../../middleware/auth-middleware.js';
import { successResponse, errorResponse } from '../../lib/api-response.js';
import { redis } from '../../lib/redis-client.js';
import { oauthService } from './oauth-service.js';

const router = Router();
const OAUTH_STATE_TTL = 600; // 10 minutes

// --- Google OAuth ---

/** GET /api/oauth/google — redirect to Google consent screen */
router.get('/google', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    res.status(503).json(errorResponse('Google OAuth not configured'));
    return;
  }

  const state = crypto.randomBytes(32).toString('hex');
  await redis.set(`oauth:state:${state}`, req.userId!, 'EX', OAUTH_STATE_TTL);

  const redirectUri =
    env.GOOGLE_REDIRECT_URI || `http://localhost:${env.PORT}/api/oauth/google/callback`;

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

/** GET /api/oauth/google/callback — exchange code for tokens (no cookie auth — userId from state) */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      res.status(400).json(errorResponse('Missing code or state'));
      return;
    }

    // Verify state via Redis
    const userId = await redis.get(`oauth:state:${state as string}`);
    if (!userId) {
      res.status(403).json(errorResponse('Invalid or expired OAuth state'));
      return;
    }
    await redis.del(`oauth:state:${state as string}`);

    const redirectUri =
      env.GOOGLE_REDIRECT_URI || `http://localhost:${env.PORT}/api/oauth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope: string;
    };

    if (!tokenData.access_token) {
      res.status(400).json(errorResponse('Failed to exchange code for tokens'));
      return;
    }

    // Get user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = (await profileRes.json()) as {
      id: string;
      name: string;
      picture?: string;
    };

    await oauthService.connectAccount(
      userId,
      'YOUTUBE',
      {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        scopes: tokenData.scope.split(' '),
      },
      {
        platformUserId: profile.id,
        displayName: profile.name,
        avatarUrl: profile.picture,
      },
    );

    // Redirect back to frontend settings page
    res.redirect(`${env.FRONTEND_URL}/settings?connected=youtube`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth failed';
    // Sanitize error message to avoid leaking server internals
    const safeMessage = message.length > 100 ? 'Google OAuth failed' : message;
    res.redirect(`${env.FRONTEND_URL}/settings?error=${encodeURIComponent(safeMessage)}`);
  }
});

// --- TikTok OAuth ---

/** GET /api/oauth/tiktok — redirect to TikTok auth */
router.get('/tiktok', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_CLIENT_SECRET) {
    res.status(503).json(errorResponse('TikTok OAuth not configured'));
    return;
  }

  const state = crypto.randomBytes(32).toString('hex');
  await redis.set(`oauth:state:${state}`, req.userId!, 'EX', OAUTH_STATE_TTL);

  const redirectUri =
    env.TIKTOK_REDIRECT_URI || `http://localhost:${env.PORT}/api/oauth/tiktok/callback`;

  const params = new URLSearchParams({
    client_key: env.TIKTOK_CLIENT_KEY,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'user.info.basic,video.publish,video.upload',
    state,
  });

  res.redirect(`https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`);
});

/** GET /api/oauth/tiktok/callback — exchange code for tokens (no cookie auth — userId from state) */
router.get('/tiktok/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      res.status(400).json(errorResponse('Missing code or state'));
      return;
    }

    // Verify state via Redis
    const userId = await redis.get(`oauth:state:${state as string}`);
    if (!userId) {
      res.status(403).json(errorResponse('Invalid or expired OAuth state'));
      return;
    }
    await redis.del(`oauth:state:${state as string}`);

    const redirectUri =
      env.TIKTOK_REDIRECT_URI || `http://localhost:${env.PORT}/api/oauth/tiktok/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: env.TIKTOK_CLIENT_KEY!,
        client_secret: env.TIKTOK_CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      open_id: string;
      expires_in: number;
      scope: string;
    };

    if (!tokenData.access_token) {
      res.status(400).json(errorResponse('Failed to exchange TikTok code for tokens'));
      return;
    }

    // Get user profile
    const profileRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
    );
    const profileData = (await profileRes.json()) as {
      data?: { user?: { open_id: string; display_name: string; avatar_url?: string } };
    };

    const user = profileData.data?.user;

    await oauthService.connectAccount(
      userId,
      'TIKTOK',
      {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        scopes: tokenData.scope.split(','),
      },
      {
        platformUserId: user?.open_id ?? tokenData.open_id,
        displayName: user?.display_name ?? 'TikTok User',
        avatarUrl: user?.avatar_url,
      },
    );

    res.redirect(`${env.FRONTEND_URL}/settings?connected=tiktok`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth failed';
    const safeMessage = message.length > 100 ? 'TikTok OAuth failed' : message;
    res.redirect(`${env.FRONTEND_URL}/settings?error=${encodeURIComponent(safeMessage)}`);
  }
});

// --- Instagram OAuth ---

/** GET /api/oauth/instagram — redirect to Meta/Instagram consent screen */
router.get('/instagram', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!env.INSTAGRAM_APP_ID || !env.INSTAGRAM_APP_SECRET) {
    res.status(503).json(errorResponse('Instagram OAuth not configured'));
    return;
  }

  const state = crypto.randomBytes(32).toString('hex');
  await redis.set(`oauth:state:${state}`, req.userId!, 'EX', OAUTH_STATE_TTL);

  const redirectUri =
    env.INSTAGRAM_REDIRECT_URI || `http://localhost:${env.PORT}/api/oauth/instagram/callback`;

  const params = new URLSearchParams({
    client_id: env.INSTAGRAM_APP_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope:
      'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_insights',
    state,
  });

  res.redirect(`https://www.instagram.com/oauth/authorize?${params.toString()}`);
});

/** GET /api/oauth/instagram/callback — exchange code for long-lived tokens */
router.get('/instagram/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      res.status(400).json(errorResponse('Missing code or state'));
      return;
    }

    // Verify CSRF state via Redis
    const userId = await redis.get(`oauth:state:${state as string}`);
    if (!userId) {
      res.status(403).json(errorResponse('Invalid or expired OAuth state'));
      return;
    }
    await redis.del(`oauth:state:${state as string}`);

    const redirectUri =
      env.INSTAGRAM_REDIRECT_URI || `http://localhost:${env.PORT}/api/oauth/instagram/callback`;

    // Exchange code for short-lived token
    const shortTokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.INSTAGRAM_APP_ID!,
        client_secret: env.INSTAGRAM_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code as string,
      }),
    });

    const shortTokenData = (await shortTokenRes.json()) as {
      access_token?: string;
      user_id?: number;
      error_type?: string;
      error_message?: string;
    };

    if (!shortTokenData.access_token) {
      const msg = shortTokenData.error_message ?? 'Failed to exchange Instagram code for token';
      throw new Error(msg);
    }

    // Exchange short-lived token for 60-day long-lived token (POST body to avoid secret in URL)
    const longTokenRes = await fetch('https://graph.instagram.com/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'ig_exchange_token',
        client_secret: env.INSTAGRAM_APP_SECRET!,
        access_token: shortTokenData.access_token,
      }),
    });

    const longTokenData = (await longTokenRes.json()) as {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
    };

    // Fall back to short-lived token if long-lived exchange fails
    const accessToken = longTokenData.access_token ?? shortTokenData.access_token;
    // Long-lived tokens expire in ~60 days; short-lived in 1 hour
    const expiresInSeconds = longTokenData.expires_in ?? 3600;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    // Fetch Instagram user profile
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(accessToken)}`,
    );
    const profile = (await profileRes.json()) as {
      id?: string;
      username?: string;
      name?: string;
      profile_picture_url?: string;
    };

    if (!profile.id) {
      throw new Error('Failed to retrieve Instagram user profile');
    }

    await oauthService.connectAccount(
      userId,
      'INSTAGRAM',
      {
        accessToken,
        // Instagram long-lived tokens are refreshed, not exchanged via refresh_token
        refreshToken: undefined,
        expiresAt,
        scopes: [
          'instagram_business_basic',
          'instagram_business_content_publish',
          'instagram_business_manage_insights',
        ],
      },
      {
        platformUserId: profile.id,
        displayName: profile.name ?? profile.username ?? 'Instagram User',
        avatarUrl: profile.profile_picture_url,
      },
    );

    res.redirect(`${env.FRONTEND_URL}/settings?connected=instagram`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth failed';
    const safeMessage = message.length > 100 ? 'Instagram OAuth failed' : message;
    res.redirect(`${env.FRONTEND_URL}/settings?error=${encodeURIComponent(safeMessage)}`);
  }
});

// --- Disconnect ---

/** DELETE /api/oauth/accounts/:id — disconnect an account */
router.delete('/accounts/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await oauthService.disconnectAccount(req.params.id as string, req.userId!);
    res.json(successResponse({ disconnected: true }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to disconnect account';
    res.status(400).json(errorResponse(message));
  }
});

export { router as oauthRouter };
