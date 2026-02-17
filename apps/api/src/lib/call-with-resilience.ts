/**
 * Shared utility for wrapping external API calls with circuit breaker and retry logic.
 * Provides fault tolerance and graceful degradation for all platform integrations.
 */

import { CircuitBreaker } from './circuit-breaker.js';
import { retryWithBackoff } from './retry-with-backoff.js';
import { ServiceUnavailableError } from './app-errors.js';

export interface ResilientCallOptions {
  /** Max retry attempts (default 3) */
  maxAttempts?: number;
  /** Initial delay in ms (default 1000) */
  baseDelay?: number;
  /** Max delay cap in ms (default 5000) */
  maxDelay?: number;
}

/**
 * Wraps an API call with circuit breaker and retry logic.
 *
 * @param circuitBreaker - The circuit breaker instance to use
 * @param apiCall - The API call function to execute
 * @param serviceName - Name of the service for error messages
 * @param options - Retry configuration options
 * @returns The result of the API call
 * @throws ServiceUnavailableError if all retries fail or circuit is open
 */
export async function callWithResilience<T>(
  circuitBreaker: CircuitBreaker,
  apiCall: () => Promise<T>,
  serviceName: string,
  options: ResilientCallOptions = {},
): Promise<T> {
  const { maxAttempts = 3, baseDelay = 1000, maxDelay = 5000 } = options;

  try {
    return await retryWithBackoff(async () => await circuitBreaker.execute(apiCall), {
      maxAttempts,
      baseDelay,
      maxDelay,
    });
  } catch (error) {
    throw new ServiceUnavailableError(
      `${serviceName} unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
