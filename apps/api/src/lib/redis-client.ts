import { Redis } from 'ioredis';
import { redisConfig } from '../config/redis.js';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(redisConfig.url, {
    maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
    retryStrategy: redisConfig.retryStrategy,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
