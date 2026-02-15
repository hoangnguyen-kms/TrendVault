import type {
  IPlatformStatsFetcher,
  ChannelMetadata,
  PlatformVideo,
  VideoStats,
} from './platform-stats-fetcher-interface.js';

const TT_BASE = 'https://open.tiktokapis.com/v2';

export class TikTokStatsFetcher implements IPlatformStatsFetcher {
  async fetchChannelMetadata(accessToken: string, _platformChannelId: string): Promise<ChannelMetadata> {
    const res = await fetch(
      `${TT_BASE}/user/info/?fields=open_id,display_name,avatar_url,follower_count,video_count`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const data = (await res.json()) as {
      data?: {
        user?: {
          display_name: string;
          avatar_url?: string;
          follower_count?: number;
          video_count?: number;
        };
      };
    };
    const user = data.data?.user;
    if (!user) throw new Error('TikTok user info not found');
    return {
      name: user.display_name,
      avatarUrl: user.avatar_url ?? null,
      subscriberCount: user.follower_count != null ? BigInt(user.follower_count) : null,
      videoCount: user.video_count ?? null,
      viewCount: null, // TikTok doesn't expose total views in user info
    };
  }

  async fetchVideoList(
    accessToken: string,
    _platformChannelId: string,
    pageToken?: string,
  ): Promise<{ videos: PlatformVideo[]; nextPageToken?: string }> {
    const body: Record<string, unknown> = { max_count: 20 };
    if (pageToken) body.cursor = parseInt(pageToken, 10);

    const res = await fetch(`${TT_BASE}/video/list/?fields=id,title,cover_image_url,duration,create_time`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as {
      data?: {
        videos?: Array<{
          id: string;
          title?: string;
          cover_image_url?: string;
          duration?: number;
          create_time?: number;
        }>;
        cursor?: number;
        has_more?: boolean;
      };
    };

    const videos: PlatformVideo[] = (data.data?.videos ?? []).map((v) => ({
      platformVideoId: v.id,
      title: v.title ?? '',
      description: null,
      thumbnailUrl: v.cover_image_url ?? null,
      duration: v.duration ?? null,
      publishedAt: v.create_time ? new Date(v.create_time * 1000) : null,
      tags: [],
      privacyStatus: null,
    }));

    const nextPageToken = data.data?.has_more && data.data.cursor
      ? String(data.data.cursor)
      : undefined;

    return { videos, nextPageToken };
  }

  async fetchVideoStats(accessToken: string, videoIds: string[]): Promise<VideoStats[]> {
    const allStats: VideoStats[] = [];
    // TikTok: batch 20 per request, 6 req/min rate limit
    for (let i = 0; i < videoIds.length; i += 20) {
      if (i > 0) await delay(10_000); // ~6 req/min safety margin
      const batch = videoIds.slice(i, i + 20);
      const res = await fetch(
        `${TT_BASE}/video/query/?fields=id,view_count,like_count,comment_count,share_count`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filters: { video_ids: batch } }),
        },
      );
      const data = (await res.json()) as {
        data?: {
          videos?: Array<{
            id: string;
            view_count?: number;
            like_count?: number;
            comment_count?: number;
            share_count?: number;
          }>;
        };
      };
      for (const v of data.data?.videos ?? []) {
        allStats.push({
          platformVideoId: v.id,
          viewCount: BigInt(v.view_count ?? 0),
          likeCount: BigInt(v.like_count ?? 0),
          commentCount: BigInt(v.comment_count ?? 0),
          shareCount: BigInt(v.share_count ?? 0),
        });
      }
    }
    return allStats;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
