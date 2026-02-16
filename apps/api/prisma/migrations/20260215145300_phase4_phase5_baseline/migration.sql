-- Phase 4 & 5: Upload, OAuth, Channel Management & Analytics
-- These tables were applied via `prisma db push` and are already in the database.
-- This migration exists to reconcile the migration history.

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "channels" (
    "id" UUID NOT NULL,
    "connected_account_id" UUID NOT NULL,
    "platform" "Platform" NOT NULL,
    "platform_channel_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "region" VARCHAR(5),
    "subscriber_count" BIGINT,
    "total_views" BIGINT,
    "video_count" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_jobs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "downloaded_video_id" UUID NOT NULL,
    "channel_id" UUID NOT NULL,
    "platform" "Platform" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "privacy_status" TEXT NOT NULL DEFAULT 'private',
    "upload_mode" TEXT,
    "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "bullmq_job_id" TEXT,
    "platform_video_id" TEXT,
    "publish_url" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "uploaded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "published_videos" (
    "id" UUID NOT NULL,
    "channel_id" UUID NOT NULL,
    "upload_job_id" UUID,
    "platform" "Platform" NOT NULL,
    "platform_video_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "privacy_status" TEXT,
    "duration" INTEGER,
    "tags" TEXT[],
    "view_count" BIGINT DEFAULT 0,
    "like_count" BIGINT DEFAULT 0,
    "comment_count" BIGINT DEFAULT 0,
    "share_count" BIGINT DEFAULT 0,
    "last_stats_sync_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "published_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_stats_snapshots" (
    "id" UUID NOT NULL,
    "published_video_id" UUID NOT NULL,
    "view_count" BIGINT NOT NULL DEFAULT 0,
    "like_count" BIGINT NOT NULL DEFAULT 0,
    "comment_count" BIGINT NOT NULL DEFAULT 0,
    "share_count" BIGINT NOT NULL DEFAULT 0,
    "engagement_rate" DOUBLE PRECISION,
    "is_weekly_summary" BOOLEAN NOT NULL DEFAULT false,
    "snapshot_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_stats_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "channels_connected_account_id_platform_channel_id_key" ON "channels"("connected_account_id", "platform_channel_id");
CREATE INDEX "channels_connected_account_id_idx" ON "channels"("connected_account_id");

-- CreateIndex
CREATE INDEX "upload_jobs_user_id_status_idx" ON "upload_jobs"("user_id", "status");
CREATE INDEX "upload_jobs_channel_id_idx" ON "upload_jobs"("channel_id");
CREATE INDEX "upload_jobs_downloaded_video_id_idx" ON "upload_jobs"("downloaded_video_id");
CREATE INDEX "upload_jobs_status_idx" ON "upload_jobs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "published_videos_upload_job_id_key" ON "published_videos"("upload_job_id");
CREATE UNIQUE INDEX "published_videos_channel_id_platform_video_id_key" ON "published_videos"("channel_id", "platform_video_id");
CREATE INDEX "published_videos_channel_id_idx" ON "published_videos"("channel_id");
CREATE INDEX "published_videos_platform_platform_video_id_idx" ON "published_videos"("platform", "platform_video_id");

-- CreateIndex
CREATE INDEX "video_stats_snapshots_published_video_id_snapshot_at_idx" ON "video_stats_snapshots"("published_video_id", "snapshot_at");
CREATE INDEX "video_stats_snapshots_snapshot_at_idx" ON "video_stats_snapshots"("snapshot_at");

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "connected_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "upload_jobs" ADD CONSTRAINT "upload_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "upload_jobs" ADD CONSTRAINT "upload_jobs_downloaded_video_id_fkey" FOREIGN KEY ("downloaded_video_id") REFERENCES "downloaded_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "upload_jobs" ADD CONSTRAINT "upload_jobs_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "published_videos" ADD CONSTRAINT "published_videos_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "published_videos" ADD CONSTRAINT "published_videos_upload_job_id_fkey" FOREIGN KEY ("upload_job_id") REFERENCES "upload_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "video_stats_snapshots" ADD CONSTRAINT "video_stats_snapshots_published_video_id_fkey" FOREIGN KEY ("published_video_id") REFERENCES "published_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
