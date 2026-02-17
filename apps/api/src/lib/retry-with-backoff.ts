/**
 * Retry utility with exponential backoff + jitter for transient failures.
 */

import { logger } from './logger.js';

export interface RetryOptions {
  /** Maximum number of attempts (default 3) */
  maxAttempts?: number;
  /** Base delay in ms before first retry (default 1000) */
  baseDelay?: number;
  /** Maximum delay cap in ms (default 30000) */
  maxDelay?: number;
  /** Return false to skip retrying non-transient errors (default: always retry) */
  isRetryable?: (error: unknown) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxAttempts = 3, baseDelay = 1000, maxDelay = 30_000, isRetryable } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Bail immediately on non-retryable errors (4xx, auth failures, etc.)
      if (isRetryable && !isRetryable(error)) {
        logger.warn(
          { attempt, error: error instanceof Error ? error.message : 'Unknown' },
          'Non-retryable error — failing fast',
        );
        throw error;
      }

      if (attempt === maxAttempts) {
        logger.error(
          { attempt, maxAttempts, error: error instanceof Error ? error.message : 'Unknown' },
          'All retry attempts exhausted',
        );
        break;
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 1000;
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1) + jitter, maxDelay);
      logger.warn({ attempt, maxAttempts, delayMs: Math.round(delay) }, 'Retrying after backoff');
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
