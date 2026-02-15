import { prisma } from '../../../lib/prisma-client.js';
import { oauthService } from '../../oauth/oauth-service.js';
import { YouTubeStatsFetcher } from '../platform-stats/youtube-stats-fetcher.js';
import { TikTokStatsFetcher } from '../platform-stats/tiktok-stats-fetcher.js';
import type { IPlatformStatsFetcher } from '../platform-stats/platform-stats-fetcher-interface.js';

const fetchers: Record<string, IPlatformStatsFetcher> = {
  YOUTUBE: new YouTubeStatsFetcher(),
  TIKTOK: new TikTokStatsFetcher(),
};

export async function handleChannelMetadataSync(): Promise<void> {
  const channels = await prisma.channel.findMany({
    where: { isActive: true },
    include: { connectedAccount: { select: { id: true, userId: true, platform: true } } },
  });

  console.log(`[sync:channel-metadata] Syncing ${channels.length} channels`);

  for (const channel of channels) {
    try {
      const { connectedAccount } = channel;
      const fetcher = fetchers[connectedAccount.platform];
      if (!fetcher) continue;

      const accessToken = await oauthService.getDecryptedToken(
        connectedAccount.id,
        connectedAccount.userId,
      );

      const metadata = await fetcher.fetchChannelMetadata(
        accessToken,
        channel.platformChannelId,
      );

      await prisma.channel.update({
        where: { id: channel.id },
        data: {
          name: metadata.name,
          avatarUrl: metadata.avatarUrl,
          subscriberCount: metadata.subscriberCount,
          totalViews: metadata.viewCount,
          videoCount: metadata.videoCount,
          lastSyncedAt: new Date(),
        },
      });

      console.log(`[sync:channel-metadata] Updated channel: ${channel.name}`);
    } catch (err) {
      console.error(`[sync:channel-metadata] Failed for channel ${channel.id}:`, err);
    }
  }
}
