import { Worker } from 'bullmq';
import { redisConfig } from '../../config/redis.js';
import { handleChannelMetadataSync } from './handlers/channel-metadata-sync-handler.js';
import { handleVideoListSync } from './handlers/video-list-sync-handler.js';
import { handleStatsSnapshotSync } from './handlers/stats-snapshot-sync-handler.js';
import { handleStatsAggregation } from './handlers/stats-aggregation-handler.js';
import { handlePartitionManagement } from './handlers/partition-management-handler.js';

export function createSyncWorker(): Worker {
  const worker = new Worker(
    'sync',
    async (job) => {
      console.log(`[sync] Processing job: ${job.name}`);
      switch (job.name) {
        case 'channel-metadata-sync':
          await handleChannelMetadataSync();
          break;
        case 'video-list-sync':
          await handleVideoListSync();
          break;
        case 'stats-snapshot-recent':
          await handleStatsSnapshotSync(true);
          break;
        case 'stats-snapshot-all':
          await handleStatsSnapshotSync(false);
          break;
        case 'stats-aggregation':
          await handleStatsAggregation();
          break;
        case 'partition-management':
          await handlePartitionManagement();
          break;
        default:
          console.warn(`[sync] Unknown job name: ${job.name}`);
      }
      console.log(`[sync] Completed job: ${job.name}`);
    },
    { connection: { url: redisConfig.url }, concurrency: 1 },
  );

  worker.on('failed', (job, err) => {
    console.error(`[sync] Job ${job?.name} failed:`, err.message);
  });

  return worker;
}
