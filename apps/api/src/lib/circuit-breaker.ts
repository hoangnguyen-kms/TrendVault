/**
 * Circuit Breaker pattern — protects external API calls from cascading failures.
 * States: CLOSED (normal) → OPEN (blocking) → HALF_OPEN (probing).
 */

import { AppError } from './app-errors.js';
import { logger } from './logger.js';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  /** Number of failures before opening the circuit (default 5) */
  failureThreshold?: number;
  /** Time in ms before transitioning from OPEN → HALF_OPEN (default 30000) */
  resetTimeout?: number;
  /** Window in ms to track failures — failures older than this are ignored (default 60000) */
  monitorWindow?: number;
}

export class CircuitBreakerError extends AppError {
  constructor(
    public readonly circuitName: string,
    message?: string,
  ) {
    super(message ?? `Service temporarily unavailable — circuit "${circuitName}" is OPEN`, 503);
    this.name = 'CircuitBreakerError';
  }
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number[] = [];
  private lastFailureTime = 0;
  private halfOpenInFlight = false;

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly monitorWindow: number;

  constructor(
    private readonly name: string,
    options: CircuitBreakerOptions = {},
  ) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 30_000;
    this.monitorWindow = options.monitorWindow ?? 60_000;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenInFlight = false;
        logger.info({ circuit: this.name }, 'Circuit breaker → HALF_OPEN');
      } else {
        throw new CircuitBreakerError(this.name);
      }
    }

    // In HALF_OPEN, allow only one probe request at a time
    if (this.state === 'HALF_OPEN' && this.halfOpenInFlight) {
      throw new CircuitBreakerError(
        this.name,
        `Circuit "${this.name}" is HALF_OPEN — probe in flight`,
      );
    }

    if (this.state === 'HALF_OPEN') {
      this.halfOpenInFlight = true;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  private onSuccess(): void {
    if (this.state !== 'CLOSED') {
      logger.info({ circuit: this.name, previousState: this.state }, 'Circuit breaker → CLOSED');
    }
    this.failures = [];
    this.state = 'CLOSED';
    this.halfOpenInFlight = false;
  }

  private onFailure(): void {
    const now = Date.now();
    this.lastFailureTime = now;
    this.halfOpenInFlight = false;

    // Prune failures outside the monitor window
    const windowStart = now - this.monitorWindow;
    this.failures = this.failures.filter((t) => t >= windowStart);
    this.failures.push(now);

    if (this.failures.length >= this.failureThreshold) {
      this.state = 'OPEN';
      logger.error(
        {
          circuit: this.name,
          failureCount: this.failures.length,
          threshold: this.failureThreshold,
        },
        'Circuit breaker → OPEN',
      );
    }
  }
}
