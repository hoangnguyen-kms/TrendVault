import { prisma } from '../../lib/prisma-client.js';
import { getStorageService } from '../../services/storage/storage-factory.js';
import { downloadQueue } from './jobs/download-queue.js';
import { buildVideoUrl, serializeDownload, ConflictError } from './download-helpers.js';
import type { DownloadStatus } from '@prisma/client';

interface QueueResult {
  id: string;
  bullmqJobId: string;
  status: string;
}

export class DownloadService {
  async queueDownload(userId: string, trendingVideoId: string): Promise<QueueResult> {
    // 0. Per-user active download limit
    const activeCount = await prisma.downloadedVideo.count({
      where: { userId, status: { in: ['PENDING', 'DOWNLOADING'] } },
    });
    if (activeCount >= 5) {
      throw new Error('Too many active downloads (max 5). Wait for current downloads to finish.');
    }

    // 1. Get trending video
    const trendingVideo = await prisma.trendingVideo.findUnique({
      where: { id: trendingVideoId },
    });
    if (!trendingVideo) {
      throw new Error('Trending video not found');
    }

    // 2. Dedup check (same user + platform + platformVideoId)
    const existing = await prisma.downloadedVideo.findUnique({
      where: {
        userId_platform_platformVideoId: {
          userId,
          platform: trendingVideo.platform,
          platformVideoId: trendingVideo.platformVideoId,
        },
      },
    });

    if (existing) {
      if (existing.status === 'COMPLETED') {
        throw new ConflictError('Video already downloaded');
      }
      if (existing.status === 'PENDING' || existing.status === 'DOWNLOADING') {
        throw new ConflictError('Download already in progress');
      }
      // If FAILED or CANCELLED, delete old record and re-queue
      await prisma.downloadedVideo.delete({ where: { id: existing.id } });
    }

    // 3. Create download record
    const download = await prisma.downloadedVideo.create({
      data: {
        userId,
        trendingVideoId,
        platform: trendingVideo.platform,
        platformVideoId: trendingVideo.platformVideoId,
        title: trendingVideo.title,
        description: trendingVideo.description,
        thumbnailUrl: trendingVideo.thumbnailUrl,
        duration: trendingVideo.duration,
        status: 'PENDING',
      },
    });

    // 4. Build video URL from platform + platformVideoId (+ channelId for TikTok)
    const videoUrl = buildVideoUrl(
      trendingVideo.platform,
      trendingVideo.platformVideoId,
      trendingVideo.channelId,
    );

    // 5. Queue BullMQ job
    const jobId = `dl-${download.id}`;
    await downloadQueue.add(
      'download',
      {
        downloadedVideoId: download.id,
        url: videoUrl,
        platform: trendingVideo.platform,
        platformVideoId: trendingVideo.platformVideoId,
        userId,
      },
      { jobId },
    );

    // 6. Store job ID on the record
    await prisma.downloadedVideo.update({
      where: { id: download.id },
      data: { bullmqJobId: jobId },
    });

    return { id: download.id, bullmqJobId: jobId, status: 'PENDING' };
  }

  async batchQueueDownloads(
    userId: string,
    trendingVideoIds: string[],
  ): Promise<QueueResult[]> {
    const results: QueueResult[] = [];
    for (const tvId of trendingVideoIds) {
      try {
        const result = await this.queueDownload(userId, tvId);
        results.push(result);
      } catch (error) {
        // Skip duplicates/errors in batch mode, continue with rest
        results.push({
          id: tvId,
          bullmqJobId: '',
          status: error instanceof ConflictError ? 'DUPLICATE' : 'ERROR',
        });
      }
    }
    return results;
  }

  async getDownloads(
    userId: string,
    params: {
      platform?: string;
      status?: string;
      page: number;
      limit: number;
      sortBy: string;
      sortOrder: string;
    },
  ) {
    const where: Record<string, unknown> = { userId };
    if (params.platform && params.platform !== 'ALL') {
      where.platform = params.platform;
    }
    if (params.status && params.status !== 'ALL') {
      where.status = params.status as DownloadStatus;
    }

    const [data, total] = await Promise.all([
      prisma.downloadedVideo.findMany({
        where,
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.downloadedVideo.count({ where }),
    ]);

    return {
      data: data.map(serializeDownload),
      page: params.page,
      limit: params.limit,
      total,
      hasMore: params.page * params.limit < total,
    };
  }

  async getDownloadById(userId: string, id: string) {
    const download = await prisma.downloadedVideo.findFirst({
      where: { id, userId },
    });
    if (!download) throw new Error('Download not found');
    return serializeDownload(download);
  }

  async getDownloadUrl(userId: string, id: string): Promise<string> {
    const download = await prisma.downloadedVideo.findFirst({
      where: { id, userId, status: 'COMPLETED' },
    });
    if (!download || !download.storageKey) {
      throw new Error('Download not available');
    }
    const storage = getStorageService();
    return storage.getDownloadUrl(download.storageKey, 900); // 15 min expiry
  }

  async cancelDownload(userId: string, id: string): Promise<void> {
    const download = await prisma.downloadedVideo.findFirst({
      where: { id, userId },
    });
    if (!download) throw new Error('Download not found');

    if (download.status === 'PENDING' || download.status === 'DOWNLOADING') {
      // Remove from BullMQ queue if still pending
      if (download.bullmqJobId) {
        const job = await downloadQueue.getJob(download.bullmqJobId);
        if (job) {
          await job.remove().catch(() => {
            // Job might already be active, that's OK
          });
        }
      }
      await prisma.downloadedVideo.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    }
  }

  async retryDownload(userId: string, id: string): Promise<QueueResult> {
    const download = await prisma.downloadedVideo.findFirst({
      where: { id, userId, status: { in: ['FAILED', 'CANCELLED'] } },
    });
    if (!download) throw new Error('Download not found or not retryable');

    // Delete old record and re-queue via the trending video
    await prisma.downloadedVideo.delete({ where: { id } });
    return this.queueDownload(userId, download.trendingVideoId);
  }

  async deleteDownload(userId: string, id: string): Promise<void> {
    const download = await prisma.downloadedVideo.findFirst({
      where: { id, userId },
    });
    if (!download) throw new Error('Download not found');

    // Delete from storage if exists
    if (download.storageKey) {
      const storage = getStorageService();
      await storage.delete(download.storageKey).catch(() => {});
    }

    await prisma.downloadedVideo.delete({ where: { id } });
  }
}
