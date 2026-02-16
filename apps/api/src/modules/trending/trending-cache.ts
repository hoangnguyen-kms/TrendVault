import { redis } from '../../lib/redis-client.js';

const KEY_PREFIX = 'trending';

export const trendingCache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await redis.get(`${KEY_PREFIX}:${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await redis.set(`${KEY_PREFIX}:${key}`, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Non-critical — cache write failures shouldn't block responses
    }
  },

  async acquireLock(key: string, ttlSeconds = 300): Promise<boolean> {
    try {
      const result = await redis.set(`${KEY_PREFIX}:lock:${key}`, '1', 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch {
      return false;
    }
  },

  async releaseLock(key: string): Promise<void> {
    try {
      await redis.del(`${KEY_PREFIX}:lock:${key}`);
    } catch {
      // Best-effort lock release
    }
  },
};
