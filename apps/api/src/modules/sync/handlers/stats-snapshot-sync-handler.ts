import { prisma } from '../../../lib/prisma-client.js';
import { oauthService } from '../../oauth/oauth-service.js';
import { YouTubeStatsFetcher } from '../platform-stats/youtube-stats-fetcher.js';
import { TikTokStatsFetcher } from '../platform-stats/tiktok-stats-fetcher.js';
import type { IPlatformStatsFetcher } from '../platform-stats/platform-stats-fetcher-interface.js';

const fetchers: Record<string, IPlatformStatsFetcher> = {
  YOUTUBE: new YouTubeStatsFetcher(),
  TIKTOK: new TikTokStatsFetcher(),
};

export async function handleStatsSnapshotSync(recentOnly: boolean): Promise<void> {
  const channels = await prisma.channel.findMany({
    where: { isActive: true },
    include: { connectedAccount: { select: { id: true, userId: true, platform: true } } },
  });

  const label = recentOnly ? 'recent' : 'all';
  console.log(`[sync:stats-snapshot:${label}] Processing ${channels.length} channels`);

  for (const channel of channels) {
    try {
      const { connectedAccount } = channel;
      const fetcher = fetchers[connectedAccount.platform];
      if (!fetcher) continue;

      const dateFilter = recentOnly
        ? { publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        : {};

      const videos = await prisma.publishedVideo.findMany({
        where: { channelId: channel.id, ...dateFilter },
        select: { id: true, platformVideoId: true },
      });

      if (videos.length === 0) continue;

      const accessToken = await oauthService.getDecryptedToken(
        connectedAccount.id,
        connectedAccount.userId,
      );

      const videoIds = videos.map((v) => v.platformVideoId);
      const stats = await fetcher.fetchVideoStats(accessToken, videoIds);
      const statsMap = new Map(stats.map((s) => [s.platformVideoId, s]));
      const now = new Date();

      for (const video of videos) {
        const stat = statsMap.get(video.platformVideoId);
        if (!stat) continue;

        const views = Number(stat.viewCount);
        const likes = Number(stat.likeCount);
        const comments = Number(stat.commentCount);
        const shares = Number(stat.shareCount);
        const engagementRate = views > 0 ? (likes + comments + shares) / views : 0;

        // Insert snapshot
        await prisma.videoStatsSnapshot.create({
          data: {
            publishedVideoId: video.id,
            viewCount: stat.viewCount,
            likeCount: stat.likeCount,
            commentCount: stat.commentCount,
            shareCount: stat.shareCount,
            engagementRate,
            snapshotAt: now,
          },
        });

        // Update latest stats on published video
        await prisma.publishedVideo.update({
          where: { id: video.id },
          data: {
            viewCount: stat.viewCount,
            likeCount: stat.likeCount,
            commentCount: stat.commentCount,
            shareCount: stat.shareCount,
            lastStatsSyncAt: now,
          },
        });
      }

      console.log(
        `[sync:stats-snapshot:${label}] Synced ${videos.length} videos for: ${channel.name}`,
      );
    } catch (err) {
      console.error(`[sync:stats-snapshot:${label}] Failed for channel ${channel.id}:`, err);
    }
  }
}
