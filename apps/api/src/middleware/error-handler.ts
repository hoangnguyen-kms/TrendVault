import { Request, Response, NextFunction } from 'express';
import { env } from '../config/environment.js';
import { errorResponse } from '../lib/api-response.js';
import { AppError, ValidationError } from '../lib/app-errors.js';

/**
 * Global error handler middleware.
 * NOTE: All 4 parameters are required by Express error middleware signature.
 * The 'next' parameter is unused but must be present for Express to recognize this as error middleware.
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', err);

  const isDevelopment = env.NODE_ENV === 'development';

  // Handle AppError instances with proper status codes
  if (err instanceof ValidationError) {
    const response = errorResponse(err.message, err.details);
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof AppError) {
    const response = errorResponse(
      err.message,
      isDevelopment && err.stack ? [{ field: 'stack', message: err.stack }] : undefined,
    );
    res.status(err.statusCode).json(response);
    return;
  }

  // Unknown errors default to 500
  const response = errorResponse(
    isDevelopment ? err.message : 'Internal server error',
    isDevelopment && err.stack ? [{ field: 'stack', message: err.stack }] : undefined,
  );

  res.status(500).json(response);
}
