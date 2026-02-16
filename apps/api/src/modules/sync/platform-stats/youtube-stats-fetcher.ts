import type {
  IPlatformStatsFetcher,
  ChannelMetadata,
  PlatformVideo,
  VideoStats,
} from './platform-stats-fetcher-interface.js';

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export class YouTubeStatsFetcher implements IPlatformStatsFetcher {
  async fetchChannelMetadata(accessToken: string, channelId: string): Promise<ChannelMetadata> {
    const url = `${YT_BASE}/channels?part=snippet,statistics&id=${channelId}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = (await res.json()) as {
      items?: Array<{
        snippet: { title: string; thumbnails?: { default?: { url: string } } };
        statistics: { subscriberCount?: string; viewCount?: string; videoCount?: string };
      }>;
    };
    const ch = data.items?.[0];
    if (!ch) throw new Error(`YouTube channel not found: ${channelId}`);
    return {
      name: ch.snippet.title,
      avatarUrl: ch.snippet.thumbnails?.default?.url ?? null,
      subscriberCount: ch.statistics.subscriberCount ? BigInt(ch.statistics.subscriberCount) : null,
      videoCount: ch.statistics.videoCount ? parseInt(ch.statistics.videoCount, 10) : null,
      viewCount: ch.statistics.viewCount ? BigInt(ch.statistics.viewCount) : null,
    };
  }

  async fetchVideoList(
    accessToken: string,
    channelId: string,
    pageToken?: string,
  ): Promise<{ videos: PlatformVideo[]; nextPageToken?: string }> {
    const params = new URLSearchParams({
      part: 'snippet',
      channelId,
      type: 'video',
      order: 'date',
      maxResults: '50',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const searchRes = await fetch(`${YT_BASE}/search?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const searchData = (await searchRes.json()) as {
      items?: Array<{ id: { videoId: string } }>;
      nextPageToken?: string;
    };

    const videoIds = (searchData.items ?? []).map((i) => i.id.videoId).filter(Boolean);
    if (videoIds.length === 0) return { videos: [], nextPageToken: undefined };

    // Fetch full video details
    const detailRes = await fetch(
      `${YT_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const detailData = (await detailRes.json()) as {
      items?: Array<{
        id: string;
        snippet: {
          title: string;
          description: string;
          thumbnails?: { medium?: { url: string } };
          publishedAt: string;
          tags?: string[];
        };
        statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
        contentDetails: { duration: string };
        status?: { privacyStatus?: string };
      }>;
    };

    const videos: PlatformVideo[] = (detailData.items ?? []).map((v) => ({
      platformVideoId: v.id,
      title: v.snippet.title,
      description: v.snippet.description ?? null,
      thumbnailUrl: v.snippet.thumbnails?.medium?.url ?? null,
      duration: parseDuration(v.contentDetails.duration),
      publishedAt: new Date(v.snippet.publishedAt),
      tags: v.snippet.tags ?? [],
      privacyStatus: v.status?.privacyStatus ?? null,
    }));

    return { videos, nextPageToken: searchData.nextPageToken };
  }

  async fetchVideoStats(accessToken: string, videoIds: string[]): Promise<VideoStats[]> {
    const allStats: VideoStats[] = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const res = await fetch(`${YT_BASE}/videos?part=statistics&id=${batch.join(',')}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = (await res.json()) as {
        items?: Array<{
          id: string;
          statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
        }>;
      };
      for (const item of data.items ?? []) {
        allStats.push({
          platformVideoId: item.id,
          viewCount: BigInt(item.statistics.viewCount ?? 0),
          likeCount: BigInt(item.statistics.likeCount ?? 0),
          commentCount: BigInt(item.statistics.commentCount ?? 0),
          shareCount: 0n, // YouTube doesn't expose share count
        });
      }
    }
    return allStats;
  }
}

/** Parse ISO 8601 duration (PT1H2M3S) to seconds */
function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return parseInt(m[1] || '0') * 3600 + parseInt(m[2] || '0') * 60 + parseInt(m[3] || '0');
}
