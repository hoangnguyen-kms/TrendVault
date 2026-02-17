import { prisma } from '../lib/prisma-client.js';
import { detectShort, computeAspectRatio } from '../modules/trending/shorts-detection-service.js';

interface ThumbnailDimensions {
  width?: number;
  height?: number;
}

/**
 * Backfill script: Detects YouTube Shorts and updates TrendingVideo & DownloadedVideo records.
 * Processes videos where platform='YOUTUBE' AND duration <= 180 seconds.
 * Uses stored rawMetadata for TrendingVideo and direct width/height for DownloadedVideo.
 */
async function backfillShortsDetection() {
  const BATCH_SIZE = 100;
  let trendingProcessed = 0;
  let trendingShortsFound = 0;
  let trendingErrors = 0;
  let downloadedProcessed = 0;
  let downloadedShortsFound = 0;
  let downloadedErrors = 0;

  try {
    console.log('Starting backfill: TrendingVideo shorts detection...');

    // Process TrendingVideo records
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const trendingVideos = await prisma.trendingVideo.findMany({
        where: {
          platform: 'YOUTUBE',
          duration: { lte: 180 },
        },
        select: {
          id: true,
          duration: true,
          title: true,
          rawMetadata: true,
          isShort: true,
        },
        skip,
        take: BATCH_SIZE,
      });

      if (trendingVideos.length === 0) {
        hasMore = false;
        break;
      }

      const updates: Array<{ id: string; isShort: boolean; aspectRatio: number | null }> = [];

      for (const video of trendingVideos) {
        try {
          // Extract thumbnail dimensions from rawMetadata
          let thumbnailWidth: number | null = null;
          let thumbnailHeight: number | null = null;

          if (video.rawMetadata && typeof video.rawMetadata === 'object') {
            const meta = video.rawMetadata as Record<string, unknown>;
            const thumbnails = meta.thumbnails as Record<string, ThumbnailDimensions> | undefined;

            if (thumbnails?.high) {
              thumbnailWidth = thumbnails.high.width ?? null;
              thumbnailHeight = thumbnails.high.height ?? null;
            }
          }

          const isShort = detectShort({
            duration: video.duration,
            thumbnailWidth,
            thumbnailHeight,
            title: video.title,
          });

          let aspectRatio: number | null = null;
          if (thumbnailWidth && thumbnailHeight && thumbnailHeight > 0) {
            aspectRatio = computeAspectRatio(thumbnailWidth, thumbnailHeight);
          }

          if (isShort !== video.isShort || aspectRatio !== null) {
            updates.push({
              id: video.id,
              isShort,
              aspectRatio,
            });

            if (isShort) {
              trendingShortsFound++;
            }
          }

          trendingProcessed++;
        } catch (error) {
          trendingErrors++;
          console.error(`Error processing TrendingVideo ${video.id}:`, error);
        }
      }

      // Batch update TrendingVideo records
      if (updates.length > 0) {
        for (const update of updates) {
          await prisma.trendingVideo.update({
            where: { id: update.id },
            data: {
              isShort: update.isShort,
              ...(update.aspectRatio !== null && { aspectRatio: update.aspectRatio }),
            },
          });
        }
      }

      skip += BATCH_SIZE;
      console.log(
        `TrendingVideo: Processed ${trendingProcessed}, Shorts found: ${trendingShortsFound}`,
      );
    }

    console.log('\nStarting backfill: DownloadedVideo shorts detection...');

    // Process DownloadedVideo records
    skip = 0;
    hasMore = true;

    while (hasMore) {
      const downloadedVideos = await prisma.downloadedVideo.findMany({
        where: {
          platform: 'YOUTUBE',
          duration: { lte: 180 },
        },
        select: {
          id: true,
          duration: true,
          title: true,
          width: true,
          height: true,
          isShort: true,
        },
        skip,
        take: BATCH_SIZE,
      });

      if (downloadedVideos.length === 0) {
        hasMore = false;
        break;
      }

      const updates: Array<{ id: string; isShort: boolean; aspectRatio: number | null }> = [];

      for (const video of downloadedVideos) {
        try {
          const isShort = detectShort({
            duration: video.duration,
            thumbnailWidth: video.width,
            thumbnailHeight: video.height,
            title: video.title,
          });

          let aspectRatio: number | null = null;
          if (video.width && video.height && video.height > 0) {
            aspectRatio = computeAspectRatio(video.width, video.height);
          }

          if (isShort !== video.isShort || aspectRatio !== null) {
            updates.push({
              id: video.id,
              isShort,
              aspectRatio,
            });

            if (isShort) {
              downloadedShortsFound++;
            }
          }

          downloadedProcessed++;
        } catch (error) {
          downloadedErrors++;
          console.error(`Error processing DownloadedVideo ${video.id}:`, error);
        }
      }

      // Batch update DownloadedVideo records
      if (updates.length > 0) {
        for (const update of updates) {
          await prisma.downloadedVideo.update({
            where: { id: update.id },
            data: {
              isShort: update.isShort,
              ...(update.aspectRatio !== null && { aspectRatio: update.aspectRatio }),
            },
          });
        }
      }

      skip += BATCH_SIZE;
      console.log(
        `DownloadedVideo: Processed ${downloadedProcessed}, Shorts found: ${downloadedShortsFound}`,
      );
    }

    console.log('\n=== BACKFILL SUMMARY ===');
    console.log(
      `TrendingVideo: ${trendingProcessed} processed, ${trendingShortsFound} shorts found, ${trendingErrors} errors`,
    );
    console.log(
      `DownloadedVideo: ${downloadedProcessed} processed, ${downloadedShortsFound} shorts found, ${downloadedErrors} errors`,
    );
    console.log(
      `Total: ${trendingProcessed + downloadedProcessed} processed, ${trendingShortsFound + downloadedShortsFound} shorts found`,
    );
  } catch (error) {
    console.error('Fatal error during backfill:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backfillShortsDetection();
