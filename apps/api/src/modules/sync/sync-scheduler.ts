import { Queue } from 'bullmq';
import { redisConfig } from '../../config/redis.js';

export const syncQueue = new Queue('sync', { connection: { url: redisConfig.url } });

export async function scheduleSyncJobs(): Promise<void> {
  // Channel metadata sync: every 6 hours
  await syncQueue.add('channel-metadata-sync', {}, {
    repeat: { pattern: '0 */6 * * *' },
    jobId: 'channel-metadata-sync',
  });

  // Video list sync: every 12 hours
  await syncQueue.add('video-list-sync', {}, {
    repeat: { pattern: '0 */12 * * *' },
    jobId: 'video-list-sync',
  });

  // Stats snapshot for recent videos (< 7 days): every 6 hours
  await syncQueue.add('stats-snapshot-recent', {}, {
    repeat: { pattern: '0 1,7,13,19 * * *' },
    jobId: 'stats-snapshot-recent',
  });

  // Stats snapshot for all videos: daily at 3 AM
  await syncQueue.add('stats-snapshot-all', {}, {
    repeat: { pattern: '0 3 * * *' },
    jobId: 'stats-snapshot-all',
  });

  // Stats aggregation (90d+ → weekly summaries): daily at 2 AM
  await syncQueue.add('stats-aggregation', {}, {
    repeat: { pattern: '0 2 * * *' },
    jobId: 'stats-aggregation',
  });

  // Partition management: 1st of each month at midnight
  await syncQueue.add('partition-management', {}, {
    repeat: { pattern: '0 0 1 * *' },
    jobId: 'partition-management',
  });
}
