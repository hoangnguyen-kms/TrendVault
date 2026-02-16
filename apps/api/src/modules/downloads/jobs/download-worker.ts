import { Worker, Job, QueueEvents } from 'bullmq';
import fs from 'fs';
import { redisConfig } from '../../../config/redis.js';
import { YtdlpService } from '../ytdlp-service.js';
import { getStorageService } from '../../../services/storage/storage-factory.js';
import { prisma } from '../../../lib/prisma-client.js';
import { getIO } from '../../../config/socket-io.js';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

interface DownloadJobData {
  downloadedVideoId: string;
  url: string;
  platform: string;
  platformVideoId: string;
  userId: string;
}

const ytdlp = new YtdlpService();

/** Best-effort delete of a temp file */
function cleanupTempFile(filePath: string | undefined): void {
  if (!filePath) return;
  try {
    fs.unlinkSync(filePath);
  } catch {
    /* ignore */
  }
}

export function createDownloadWorker(): Worker<DownloadJobData> {
  const storage = getStorageService();

  const worker = new Worker<DownloadJobData>(
    'video-downloads',
    async (job: Job<DownloadJobData>) => {
      const { downloadedVideoId, url, platform, platformVideoId, userId } = job.data;
      let tempFilePath: string | undefined;

      try {
        // 1. Verify record still exists (may have been deleted by retry/dedup)
        const record = await prisma.downloadedVideo.findUnique({
          where: { id: downloadedVideoId },
          select: { id: true, status: true },
        });
        if (!record) {
          console.warn(
            `[download-worker] Record ${downloadedVideoId} no longer exists, skipping job`,
          );
          return { downloadedVideoId, skipped: true };
        }
        if (record.status === 'CANCELLED') {
          return { downloadedVideoId, cancelled: true };
        }

        // 2. Mark as DOWNLOADING
        await prisma.downloadedVideo.update({
          where: { id: downloadedVideoId },
          data: { status: 'DOWNLOADING', bullmqJobId: job.id },
        });

        // 2. Download with yt-dlp (progress scaled to 0-80%)
        const result = await ytdlp.download({
          url,
          onProgress: async (progress) => {
            const scaledPercent = Math.floor(progress.percent * 0.8);
            await job.updateProgress({
              percent: scaledPercent,
              speed: progress.speed,
              eta: progress.eta,
              phase: 'downloading',
              downloadedVideoId,
            });
          },
        });

        tempFilePath = result.filePath;

        // 2b. File size guard
        if (result.fileSize > MAX_FILE_SIZE) {
          cleanupTempFile(tempFilePath);
          throw new Error(
            `File too large (${Math.round(result.fileSize / 1024 / 1024)}MB, max 500MB)`,
          );
        }

        // 2c. Check if download was cancelled while downloading
        const current = await prisma.downloadedVideo.findUnique({
          where: { id: downloadedVideoId },
          select: { status: true },
        });
        if (current?.status === 'CANCELLED') {
          cleanupTempFile(tempFilePath);
          return { downloadedVideoId, cancelled: true };
        }

        // 3. Upload to storage (80-95%)
        await job.updateProgress({ percent: 85, phase: 'uploading', downloadedVideoId });

        const ext = result.filePath.split('.').pop() ?? 'mp4';
        const storageKey = `downloads/${userId}/${platform}/${platformVideoId}.${ext}`;
        const fileStream = fs.createReadStream(result.filePath);

        await storage.upload(storageKey, fileStream, {
          'content-type': result.mimeType,
          'x-platform': platform,
          'x-video-id': platformVideoId,
        });

        await job.updateProgress({ percent: 95, phase: 'finalizing', downloadedVideoId });

        // 4. Update DB record as COMPLETED
        const fileSize =
          Number.isFinite(result.fileSize) && result.fileSize >= 0
            ? BigInt(Math.floor(result.fileSize))
            : BigInt(0);

        await prisma.downloadedVideo.update({
          where: { id: downloadedVideoId },
          data: {
            status: 'COMPLETED',
            storageKey,
            storageBucket: process.env.S3_BUCKET ?? 'trendvault-videos',
            fileSize,
            mimeType: result.mimeType,
            duration: result.duration,
            resolution: result.resolution,
            progress: 100,
            downloadedAt: new Date(),
          },
        });

        // 5. Cleanup temp file
        cleanupTempFile(tempFilePath);

        await job.updateProgress({ percent: 100, phase: 'completed', downloadedVideoId });
        return { downloadedVideoId, storageKey };
      } catch (err) {
        cleanupTempFile(tempFilePath);
        throw err;
      }
    },
    {
      connection: { url: redisConfig.url },
      concurrency: 3,
    },
  );

  worker.on('failed', async (job, err) => {
    if (job) {
      console.error(`[download-worker] Job ${job.id} failed:`, err.message);
      try {
        await prisma.downloadedVideo.update({
          where: { id: job.data.downloadedVideoId },
          data: { status: 'FAILED', errorMessage: err.message },
        });
      } catch {
        // Record may have been deleted by retry/dedup — nothing to update
      }
    }
  });

  return worker;
}

/** Bridge BullMQ progress/completed/failed events to Socket.IO rooms */
export function initDownloadQueueEvents(): void {
  const queueEvents = new QueueEvents('video-downloads', {
    connection: { url: redisConfig.url },
  });
  const io = getIO();

  queueEvents.on('progress', ({ jobId, data }) => {
    io.to(jobId!).emit('download:progress', { jobId, ...(data as object) });
  });

  queueEvents.on('completed', ({ jobId }) => {
    io.to(jobId!).emit('download:completed', { jobId });
  });

  queueEvents.on('failed', ({ jobId, failedReason }) => {
    io.to(jobId!).emit('download:failed', { jobId, error: failedReason });
  });
}
