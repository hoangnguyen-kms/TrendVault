import { Worker, Job, QueueEvents } from 'bullmq';
import { redisConfig } from '../../../config/redis.js';
import { prisma } from '../../../lib/prisma-client.js';
import { getStorageService } from '../../../services/storage/storage-factory.js';
import { oauthService } from '../../oauth/oauth-service.js';
import { YouTubeUploader } from '../uploaders/youtube-uploader.js';
import { TikTokUploader } from '../uploaders/tiktok-uploader.js';
import { getIO } from '../../../config/socket-io.js';

interface UploadJobData {
  uploadJobId: string;
  downloadedVideoId: string;
  channelId: string;
  platform: string;
  title: string;
  description: string | null;
  tags: string[];
  privacyStatus: string;
  uploadMode: string | null;
  userId: string;
  connectedAccountId: string;
}

export function createUploadWorker(): Worker<UploadJobData> {
  const storage = getStorageService();
  const youtubeUploader = new YouTubeUploader();
  const tiktokUploader = new TikTokUploader();

  const worker = new Worker<UploadJobData>(
    'video-uploads',
    async (job: Job<UploadJobData>) => {
      const data = job.data;

      // 1. Mark as UPLOADING
      await prisma.uploadJob.update({
        where: { id: data.uploadJobId },
        data: { status: 'UPLOADING', bullmqJobId: job.id },
      });

      // 2. Decrypt access token
      const accessToken = await oauthService.getDecryptedToken(
        data.connectedAccountId,
        data.userId,
      );

      // 3. Get downloaded video record and stream from S3
      const downloadedVideo = await prisma.downloadedVideo.findUniqueOrThrow({
        where: { id: data.downloadedVideoId },
      });

      if (!downloadedVideo.storageKey) {
        throw new Error('Downloaded video has no storage key');
      }

      const videoStream = await storage.getReadStream(downloadedVideo.storageKey);
      const totalBytes = downloadedVideo.fileSize ? Number(downloadedVideo.fileSize) : 0;

      // 4. Select uploader
      const uploader = data.platform === 'YOUTUBE' ? youtubeUploader : tiktokUploader;

      // 5. Upload with progress
      const result = await uploader.upload({
        accessToken,
        videoStream,
        title: data.title,
        description: data.description,
        tags: data.tags,
        privacyStatus: data.privacyStatus,
        uploadMode: data.uploadMode,
        totalBytes,
        onProgress: async (progress) => {
          await job.updateProgress({
            ...progress,
            uploadJobId: data.uploadJobId,
          });
          // Also update DB progress
          await prisma.uploadJob.update({
            where: { id: data.uploadJobId },
            data: { progress: progress.percent },
          }).catch(() => {}); // best-effort
        },
      });

      // 6. Update upload job as COMPLETED
      await prisma.uploadJob.update({
        where: { id: data.uploadJobId },
        data: {
          status: 'COMPLETED',
          platformVideoId: result.platformVideoId,
          publishUrl: result.publishUrl,
          progress: 100,
          uploadedAt: new Date(),
        },
      });

      // 7. Create PublishedVideo record
      await prisma.publishedVideo.create({
        data: {
          channelId: data.channelId,
          uploadJobId: data.uploadJobId,
          platform: data.platform as 'YOUTUBE' | 'TIKTOK',
          platformVideoId: result.platformVideoId,
          title: data.title,
          description: data.description,
          tags: data.tags,
          privacyStatus: data.privacyStatus,
          publishedAt: new Date(),
        },
      });

      return result;
    },
    {
      connection: { url: redisConfig.url },
      concurrency: 2,
    },
  );

  worker.on('failed', async (job, err) => {
    if (job) {
      console.error(`[upload-worker] Job ${job.id} failed:`, err.message);
      try {
        await prisma.uploadJob.update({
          where: { id: job.data.uploadJobId },
          data: { status: 'FAILED', errorMessage: err.message },
        });
      } catch {
        // Record may have been deleted — nothing to update
      }
    }
  });

  return worker;
}

/** Bridge BullMQ upload events to Socket.IO rooms */
export function initUploadQueueEvents(): void {
  const queueEvents = new QueueEvents('video-uploads', {
    connection: { url: redisConfig.url },
  });
  const io = getIO();

  queueEvents.on('progress', ({ jobId, data }) => {
    io.to(jobId!).emit('upload:progress', { jobId, ...(data as object) });
  });

  queueEvents.on('completed', ({ jobId }) => {
    io.to(jobId!).emit('upload:completed', { jobId });
  });

  queueEvents.on('failed', ({ jobId, failedReason }) => {
    io.to(jobId!).emit('upload:failed', { jobId, error: failedReason });
  });
}
