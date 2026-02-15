import { Queue } from 'bullmq';
import { redisConfig } from '../../../config/redis.js';
import { SUPPORTED_REGION_CODES } from '@trendvault/shared-types';

const PLATFORMS = ['YOUTUBE', 'TIKTOK'] as const;

export const trendingRefreshQueue = new Queue('trending-refresh', {
  connection: { url: redisConfig.url },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

/** Schedule repeatable refresh jobs for all platform+region combos */
export async function scheduleTrendingRefreshJobs(): Promise<void> {
  // Remove stale repeatable jobs first
  const existing = await trendingRefreshQueue.getRepeatableJobs();
  for (const job of existing) {
    await trendingRefreshQueue.removeRepeatableByKey(job.key);
  }

  for (const platform of PLATFORMS) {
    for (const region of SUPPORTED_REGION_CODES) {
      await trendingRefreshQueue.add(
        `refresh:${platform}:${region}`,
        { platform, region },
        {
          repeat: { every: 30 * 60 * 1000 }, // 30 minutes
          jobId: `trending-refresh:${platform}:${region}`,
        },
      );
    }
  }
}
