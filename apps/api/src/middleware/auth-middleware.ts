import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { errorResponse } from '../lib/api-response.js';

export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userId: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json(errorResponse('Authentication required'));
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json(errorResponse('Invalid or expired token'));
  }
}
