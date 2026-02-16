import http from 'http';
import { env } from './config/environment.js';
import { app } from './app.js';
import { initSocketIO } from './config/socket-io.js';
import pino from 'pino';
import { scheduleTrendingRefreshJobs } from './modules/trending/jobs/trending-refresh-job.js';
import { createTrendingRefreshWorker } from './modules/trending/jobs/trending-refresh-worker.js';
import {
  createDownloadWorker,
  initDownloadQueueEvents,
} from './modules/downloads/jobs/download-worker.js';
import { createUploadWorker, initUploadQueueEvents } from './modules/uploads/jobs/upload-worker.js';
import { scheduleSyncJobs } from './modules/sync/sync-scheduler.js';
import { createSyncWorker } from './modules/sync/sync-worker.js';

const logger = pino({
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        }
      : undefined,
});

const server = http.createServer(app);
initSocketIO(server);

server.listen(env.PORT, async () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);

  // Start BullMQ trending refresh worker + schedule jobs
  try {
    createTrendingRefreshWorker();
    await scheduleTrendingRefreshJobs();
    logger.info('Trending refresh jobs scheduled');
  } catch (error) {
    logger.error(error, 'Failed to initialize trending refresh jobs');
  }

  // Start download worker + bridge BullMQ events to Socket.IO
  try {
    createDownloadWorker();
    initDownloadQueueEvents();
    logger.info('Download worker initialized');
  } catch (error) {
    logger.error(error, 'Failed to initialize download worker');
  }

  // Start upload worker + bridge BullMQ events to Socket.IO
  try {
    createUploadWorker();
    initUploadQueueEvents();
    logger.info('Upload worker initialized');
  } catch (error) {
    logger.error(error, 'Failed to initialize upload worker');
  }

  // Start sync worker + schedule sync jobs (Phase 5)
  try {
    createSyncWorker();
    await scheduleSyncJobs();
    logger.info('Sync worker initialized and jobs scheduled');
  } catch (error) {
    logger.error(error, 'Failed to initialize sync worker');
  }
});
