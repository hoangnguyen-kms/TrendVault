-- CreateEnum
CREATE TYPE "DownloadStatus" AS ENUM ('PENDING', 'DOWNLOADING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "downloaded_videos" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "trending_video_id" UUID NOT NULL,
    "platform" "Platform" NOT NULL,
    "platform_video_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "duration" INTEGER,
    "status" "DownloadStatus" NOT NULL DEFAULT 'PENDING',
    "bullmq_job_id" TEXT,
    "storage_key" TEXT,
    "storage_bucket" TEXT,
    "file_size" BIGINT,
    "mime_type" TEXT,
    "resolution" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "downloaded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "downloaded_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "downloaded_videos_user_id_status_idx" ON "downloaded_videos"("user_id", "status");

-- CreateIndex
CREATE INDEX "downloaded_videos_status_idx" ON "downloaded_videos"("status");

-- CreateIndex
CREATE UNIQUE INDEX "downloaded_videos_user_id_platform_platform_video_id_key" ON "downloaded_videos"("user_id", "platform", "platform_video_id");

-- AddForeignKey
ALTER TABLE "downloaded_videos" ADD CONSTRAINT "downloaded_videos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloaded_videos" ADD CONSTRAINT "downloaded_videos_trending_video_id_fkey" FOREIGN KEY ("trending_video_id") REFERENCES "trending_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
