import { Request, Response, NextFunction } from 'express';
import { env } from '../config/environment.js';
import { errorResponse } from '../lib/api-response.js';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', err);

  const isDevelopment = env.NODE_ENV === 'development';

  const response = errorResponse(
    err.message || 'Internal server error',
    isDevelopment && err.stack ? [{ field: 'stack', message: err.stack }] : undefined,
  );

  res.status(500).json(response);
}
