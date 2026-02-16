import { prisma } from '../../lib/prisma-client.js';
import { uploadQueue } from './jobs/upload-queue.js';
import type { UploadStatus } from '../../lib/prisma-client.js';

const MAX_YOUTUBE_UPLOADS_PER_DAY = 4;

interface UploadInput {
  downloadedVideoId: string;
  channelId: string;
  title: string;
  description?: string | null;
  tags?: string[];
  privacyStatus?: string;
  uploadMode?: string | null;
}

function serializeUploadJob(job: Record<string, unknown>) {
  return {
    ...job,
    createdAt: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt,
    updatedAt: job.updatedAt instanceof Date ? job.updatedAt.toISOString() : job.updatedAt,
    uploadedAt:
      job.uploadedAt instanceof Date
        ? (job.uploadedAt as Date).toISOString()
        : (job.uploadedAt ?? null),
  };
}

export class UploadService {
  async createUpload(userId: string, input: UploadInput) {
    // 1. Verify downloaded video belongs to user and is COMPLETED
    const downloadedVideo = await prisma.downloadedVideo.findFirst({
      where: { id: input.downloadedVideoId, userId, status: 'COMPLETED' },
    });
    if (!downloadedVideo) {
      throw new Error('Downloaded video not found or not ready for upload');
    }

    // 2. Verify channel belongs to user
    const channel = await prisma.channel.findFirst({
      where: { id: input.channelId, connectedAccount: { userId } },
      include: { connectedAccount: { select: { id: true, platform: true } } },
    });
    if (!channel) {
      throw new Error('Channel not found or not accessible');
    }

    // 3. YouTube daily quota check
    if (channel.platform === 'YOUTUBE') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const uploadsToday = await prisma.uploadJob.count({
        where: {
          userId,
          platform: 'YOUTUBE',
          status: { in: ['PENDING', 'UPLOADING', 'PROCESSING', 'COMPLETED'] },
          createdAt: { gte: todayStart },
        },
      });
      if (uploadsToday >= MAX_YOUTUBE_UPLOADS_PER_DAY) {
        throw new Error(
          `YouTube upload limit reached (${MAX_YOUTUBE_UPLOADS_PER_DAY}/day). Try again tomorrow.`,
        );
      }
    }

    // 4. Check active upload limit (max 3 concurrent per user)
    const activeCount = await prisma.uploadJob.count({
      where: { userId, status: { in: ['PENDING', 'UPLOADING'] } },
    });
    if (activeCount >= 3) {
      throw new Error('Too many active uploads (max 3). Wait for current uploads to finish.');
    }

    // 5. Create upload job record
    const uploadJob = await prisma.uploadJob.create({
      data: {
        userId,
        downloadedVideoId: input.downloadedVideoId,
        channelId: input.channelId,
        platform: channel.platform,
        title: input.title,
        description: input.description ?? null,
        tags: input.tags ?? [],
        privacyStatus: input.privacyStatus ?? 'private',
        uploadMode: channel.platform === 'TIKTOK' ? (input.uploadMode ?? 'inbox') : null,
        status: 'PENDING',
      },
    });

    // 6. Queue BullMQ job
    const jobId = `ul-${uploadJob.id}`;
    await uploadQueue.add(
      'upload',
      {
        uploadJobId: uploadJob.id,
        downloadedVideoId: input.downloadedVideoId,
        channelId: input.channelId,
        platform: channel.platform,
        title: input.title,
        description: input.description ?? null,
        tags: input.tags ?? [],
        privacyStatus: input.privacyStatus ?? 'private',
        uploadMode: channel.platform === 'TIKTOK' ? (input.uploadMode ?? 'inbox') : null,
        userId,
        connectedAccountId: channel.connectedAccount.id,
      },
      { jobId },
    );

    await prisma.uploadJob.update({
      where: { id: uploadJob.id },
      data: { bullmqJobId: jobId },
    });

    return { id: uploadJob.id, bullmqJobId: jobId, status: 'PENDING' };
  }

  async getUploads(
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
      where.status = params.status as UploadStatus;
    }

    const [data, total] = await Promise.all([
      prisma.uploadJob.findMany({
        where,
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.uploadJob.count({ where }),
    ]);

    return {
      data: data.map((d) => serializeUploadJob(d as unknown as Record<string, unknown>)),
      page: params.page,
      limit: params.limit,
      total,
      hasMore: params.page * params.limit < total,
    };
  }

  async getUploadById(userId: string, id: string) {
    const job = await prisma.uploadJob.findFirst({ where: { id, userId } });
    if (!job) throw new Error('Upload not found');
    return serializeUploadJob(job as unknown as Record<string, unknown>);
  }

  async retryUpload(userId: string, id: string) {
    const job = await prisma.uploadJob.findFirst({
      where: { id, userId, status: { in: ['FAILED', 'CANCELLED'] } },
      include: { channel: { include: { connectedAccount: { select: { id: true } } } } },
    });
    if (!job) throw new Error('Upload not found or not retryable');

    // Reset and re-queue
    await prisma.uploadJob.update({
      where: { id },
      data: { status: 'PENDING', errorMessage: null, progress: 0 },
    });

    const bullmqJobId = `ul-${id}-retry-${Date.now()}`;
    await uploadQueue.add(
      'upload',
      {
        uploadJobId: id,
        downloadedVideoId: job.downloadedVideoId,
        channelId: job.channelId,
        platform: job.platform,
        title: job.title,
        description: job.description,
        tags: job.tags,
        privacyStatus: job.privacyStatus,
        uploadMode: job.uploadMode,
        userId,
        connectedAccountId: job.channel.connectedAccount.id,
      },
      { jobId: bullmqJobId },
    );

    await prisma.uploadJob.update({
      where: { id },
      data: { bullmqJobId },
    });

    return { id, bullmqJobId, status: 'PENDING' };
  }

  async cancelUpload(userId: string, id: string): Promise<void> {
    const job = await prisma.uploadJob.findFirst({
      where: { id, userId, status: { in: ['PENDING', 'UPLOADING'] } },
    });
    if (!job) throw new Error('Upload not found or not cancellable');

    if (job.bullmqJobId) {
      const bullmqJob = await uploadQueue.getJob(job.bullmqJobId);
      if (bullmqJob) {
        await bullmqJob.remove().catch(() => {});
      }
    }

    await prisma.uploadJob.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getYouTubeQuota(userId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const uploadsToday = await prisma.uploadJob.count({
      where: {
        userId,
        platform: 'YOUTUBE',
        status: { in: ['PENDING', 'UPLOADING', 'PROCESSING', 'COMPLETED'] },
        createdAt: { gte: todayStart },
      },
    });

    return {
      used: uploadsToday * 1600,
      limit: 10000,
      uploadsToday,
      maxUploadsPerDay: MAX_YOUTUBE_UPLOADS_PER_DAY,
      remainingUploads: Math.max(0, MAX_YOUTUBE_UPLOADS_PER_DAY - uploadsToday),
    };
  }
}

export const uploadService = new UploadService();
