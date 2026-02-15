import { env } from './environment.js';

export const redisConfig = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};
