-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('YOUTUBE', 'TIKTOK');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connected_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "platform" "Platform" NOT NULL,
    "platform_user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "access_token_encrypted" BYTEA NOT NULL,
    "refresh_token_encrypted" BYTEA,
    "token_iv" BYTEA NOT NULL,
    "token_auth_tag" BYTEA NOT NULL,
    "key_version" INTEGER NOT NULL DEFAULT 1,
    "token_expires_at" TIMESTAMP(3),
    "scopes" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connected_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trending_videos" (
    "id" UUID NOT NULL,
    "platform" "Platform" NOT NULL,
    "platform_video_id" TEXT NOT NULL,
    "region" VARCHAR(5) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "channel_name" TEXT,
    "channel_id" TEXT,
    "duration" INTEGER,
    "view_count" BIGINT,
    "like_count" BIGINT,
    "comment_count" BIGINT,
    "share_count" BIGINT,
    "published_at" TIMESTAMP(3),
    "trending_rank" INTEGER,
    "category" TEXT,
    "tags" TEXT[],
    "raw_metadata" JSONB,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trending_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "connected_accounts_user_id_idx" ON "connected_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "connected_accounts_user_id_platform_platform_user_id_key" ON "connected_accounts"("user_id", "platform", "platform_user_id");

-- CreateIndex
CREATE INDEX "trending_videos_platform_region_idx" ON "trending_videos"("platform", "region");

-- CreateIndex
CREATE INDEX "trending_videos_fetched_at_idx" ON "trending_videos"("fetched_at");

-- CreateIndex
CREATE UNIQUE INDEX "trending_videos_platform_platform_video_id_region_key" ON "trending_videos"("platform", "platform_video_id", "region");

-- AddForeignKey
ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
