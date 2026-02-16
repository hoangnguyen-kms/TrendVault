import { Worker } from 'bullmq';
import { Platform } from '../../../lib/prisma-client.js';
import { redisConfig } from '../../../config/redis.js';
import { trendingService } from '../trending-service-instance.js';

export function createTrendingRefreshWorker(): Worker {
  const worker = new Worker(
    'trending-refresh',
    async (job) => {
      const { platform, region } = job.data as { platform: string; region: string };
      await trendingService.refreshTrending(platform as Platform, region);
    },
    {
      connection: { url: redisConfig.url },
      concurrency: 3,
      limiter: { max: 10, duration: 60_000 }, // max 10 jobs/min
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[trending-refresh] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
