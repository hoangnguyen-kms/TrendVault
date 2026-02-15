import { Queue } from 'bullmq';
import { redisConfig } from '../../../config/redis.js';

export const downloadQueue = new Queue('video-downloads', {
  connection: { url: redisConfig.url },
  defaultJobOptions: {
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
  },
});
