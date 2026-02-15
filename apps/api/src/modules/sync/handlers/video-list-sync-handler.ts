import { prisma } from '../../../lib/prisma-client.js';
import { oauthService } from '../../oauth/oauth-service.js';
import { YouTubeStatsFetcher } from '../platform-stats/youtube-stats-fetcher.js';
import { TikTokStatsFetcher } from '../platform-stats/tiktok-stats-fetcher.js';
import type { IPlatformStatsFetcher } from '../platform-stats/platform-stats-fetcher-interface.js';

const fetchers: Record<string, IPlatformStatsFetcher> = {
  YOUTUBE: new YouTubeStatsFetcher(),
  TIKTOK: new TikTokStatsFetcher(),
};

export async function handleVideoListSync(): Promise<void> {
  const channels = await prisma.channel.findMany({
    where: { isActive: true },
    include: { connectedAccount: { select: { id: true, userId: true, platform: true } } },
  });

  console.log(`[sync:video-list] Syncing videos for ${channels.length} channels`);

  for (const channel of channels) {
    try {
      const { connectedAccount } = channel;
      const fetcher = fetchers[connectedAccount.platform];
      if (!fetcher) continue;

      const accessToken = await oauthService.getDecryptedToken(
        connectedAccount.id,
        connectedAccount.userId,
      );

      let pageToken: string | undefined;
      let totalSynced = 0;

      do {
        const { videos, nextPageToken } = await fetcher.fetchVideoList(
          accessToken,
          channel.platformChannelId,
          pageToken,
        );

        for (const video of videos) {
          await prisma.publishedVideo.upsert({
            where: {
              channelId_platformVideoId: {
                channelId: channel.id,
                platformVideoId: video.platformVideoId,
              },
            },
            update: {
              title: video.title,
              description: video.description,
              thumbnailUrl: video.thumbnailUrl,
              duration: video.duration,
              tags: video.tags,
              privacyStatus: video.privacyStatus,
            },
            create: {
              channelId: channel.id,
              platform: connectedAccount.platform,
              platformVideoId: video.platformVideoId,
              title: video.title,
              description: video.description,
              thumbnailUrl: video.thumbnailUrl,
              duration: video.duration,
              publishedAt: video.publishedAt,
              tags: video.tags,
              privacyStatus: video.privacyStatus,
            },
          });
          totalSynced++;
        }

        pageToken = nextPageToken;
        // Safety: max 5 pages per channel to avoid quota exhaustion
        if (totalSynced >= 250) break;
      } while (pageToken);

      console.log(`[sync:video-list] Synced ${totalSynced} videos for channel: ${channel.name}`);
    } catch (err) {
      console.error(`[sync:video-list] Failed for channel ${channel.id}:`, err);
    }
  }
}
