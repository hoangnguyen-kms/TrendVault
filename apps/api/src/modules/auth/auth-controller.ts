import { Request, Response } from 'express';
import { authService } from './auth-service.js';
import { successResponse, errorResponse } from '../../lib/api-response.js';
import { env } from '../../config/environment.js';
import type { AuthRequest } from '../../middleware/auth-middleware.js';
import type { LoginRequest, RegisterRequest } from '@trendvault/shared-types';

function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as RegisterRequest;
      const user = await authService.register(data);
      const token = authService.signToken(user.id);

      res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: parseDurationToMs(env.JWT_EXPIRES_IN),
        path: '/',
      });

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
      const token = authService.signToken(user.id);

      res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: parseDurationToMs(env.JWT_EXPIRES_IN),
        path: '/',
      });

      res.json(successResponse(user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json(errorResponse(message));
    }
  },

  logout(req: Request, res: Response): void {
    res.clearCookie('token', {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json(successResponse({ message: 'Logged out successfully' }));
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
};
