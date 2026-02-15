import { Queue } from 'bullmq';
import { redisConfig } from '../../../config/redis.js';

export const uploadQueue = new Queue('video-uploads', {
  connection: { url: redisConfig.url },
  defaultJobOptions: {
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
    attempts: 2,
    backoff: { type: 'exponential', delay: 30000 },
  },
});
