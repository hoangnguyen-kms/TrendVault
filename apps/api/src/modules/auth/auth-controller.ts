import { Request, Response } from 'express';
import { authService } from './auth-service.js';
import { successResponse, errorResponse } from '../../lib/api-response.js';
import { env } from '../../config/environment.js';
import { parseDurationToMs } from '../../lib/duration-utils.js';
import type { AuthRequest } from '../../middleware/auth-middleware.js';
import type { LoginRequest, RegisterRequest } from '@trendvault/shared-types';

/** Cookie options shared between access and refresh tokens */
function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

/** Set both access + refresh token cookies on the response */
async function setAuthCookies(res: Response, userId: string): Promise<void> {
  const accessToken = authService.signToken(userId);
  const refreshToken = await authService.createRefreshToken(userId);

  res.cookie('token', accessToken, {
    ...baseCookieOptions(),
    maxAge: parseDurationToMs(env.JWT_EXPIRES_IN),
  });

  res.cookie('refresh_token', refreshToken, {
    ...baseCookieOptions(),
    maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN),
  });
}

/** Clear both auth cookies */
function clearAuthCookies(res: Response): void {
  const opts = baseCookieOptions();
  res.clearCookie('token', opts);
  res.clearCookie('refresh_token', opts);
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as RegisterRequest;
      const user = await authService.register(data);
      await setAuthCookies(res, user.id);
      res.status(201).json(successResponse(user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json(errorResponse(message));
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as LoginRequest;
      const user = await authService.login(data);
      await setAuthCookies(res, user.id);
      res.json(successResponse(user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json(errorResponse(message));
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Revoke the current refresh token if present
      const refreshToken = req.cookies.refresh_token;
      if (refreshToken) {
        await authService.revokeRefreshToken(refreshToken);
      }
      clearAuthCookies(res);
      res.json(successResponse({ message: 'Logged out successfully' }));
    } catch (error) {
      // Still clear cookies even if DB revocation fails
      clearAuthCookies(res);
      res.json(successResponse({ message: 'Logged out successfully' }));
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        res.status(401).json(errorResponse('No refresh token'));
        return;
      }

      const result = await authService.rotateRefreshToken(refreshToken);

      if (!result) {
        clearAuthCookies(res);
        res.status(401).json(errorResponse('Invalid or expired refresh token'));
        return;
      }

      // Issue new access token + rotated refresh token
      const accessToken = authService.signToken(result.userId);

      res.cookie('token', accessToken, {
        ...baseCookieOptions(),
        maxAge: parseDurationToMs(env.JWT_EXPIRES_IN),
      });

      res.cookie('refresh_token', result.newRefreshToken, {
        ...baseCookieOptions(),
        maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN),
      });

      res.json(successResponse({ message: 'Token refreshed' }));
    } catch (error) {
      clearAuthCookies(res);
      res.status(401).json(errorResponse('Token refresh failed'));
    }
  },

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json(errorResponse('Authentication required'));
        return;
      }

      const user = await authService.getUserById(req.userId);

      if (!user) {
        res.status(404).json(errorResponse('User not found'));
        return;
      }

      res.json(successResponse(user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get user';
      res.status(500).json(errorResponse(message));
    }
  },

  async acceptTos(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json(errorResponse('Authentication required'));
        return;
      }

      const user = await authService.acceptTos(req.userId);
      res.json(successResponse(user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept ToS';
      res.status(500).json(errorResponse(message));
    }
  },
};
