import type {
  IPlatformStatsFetcher,
  ChannelMetadata,
  PlatformVideo,
  VideoStats,
} from './platform-stats-fetcher-interface.js';
import { retryWithBackoff } from '../../../lib/retry-with-backoff.js';

const IG_BASE = 'https://graph.instagram.com/v21.0';

// Instagram Graph API response types
interface IgMediaItem {
  id: string;
  caption?: string;
  timestamp?: string;
  media_type?: string;
  thumbnail_url?: string;
  permalink?: string;
}

interface IgInsightValue {
  value: number;
}

interface IgInsightMetric {
  name: string;
  values?: IgInsightValue[];
  value?: number;
}

interface IgInsightsResponse {
  data?: IgInsightMetric[];
  error?: { code: number; message: string };
}

interface IgMediaListResponse {
  data?: IgMediaItem[];
  paging?: { cursors?: { after?: string } };
}

interface IgUserResponse {
  id?: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
  error?: { code: number; message: string };
}

/**
 * Instagram Graph API stats fetcher.
 *
 * Notes:
 * - Insights data has 24-48h delay for new Reels; zeros returned gracefully
 * - 200 API calls/hour limit — process 10 videos per batch with 3s inter-batch delay
 * - Reels returned as media_type === 'VIDEO' from /media endpoint
 * - plays metric = total video views (Reels-specific)
 */
export class InstagramStatsFetcher implements IPlatformStatsFetcher {
  async fetchChannelMetadata(
    accessToken: string,
    platformChannelId: string,
  ): Promise<ChannelMetadata> {
    const url =
      `${IG_BASE}/${platformChannelId}` +
      `?fields=id,username,name,profile_picture_url,followers_count,media_count` +
      `&access_token=${accessToken}`;

    const res = await retryWithBackoff(() => fetch(url), { maxAttempts: 3, baseDelay: 1000 });
    const data = (await res.json()) as IgUserResponse;

    if (data.error) {
      throw new Error(`Instagram API error ${data.error.code}: ${data.error.message}`);
    }

    return {
      name: data.username ?? data.name ?? platformChannelId,
      avatarUrl: data.profile_picture_url ?? null,
      subscriberCount: data.followers_count != null ? BigInt(data.followers_count) : null,
      videoCount: data.media_count ?? null,
      viewCount: null, // Instagram doesn't expose total account views
    };
  }

  async fetchVideoList(
    accessToken: string,
    platformChannelId: string,
    pageToken?: string,
  ): Promise<{ videos: PlatformVideo[]; nextPageToken?: string }> {
    let url =
      `${IG_BASE}/${platformChannelId}/media` +
      `?fields=id,caption,timestamp,media_type,thumbnail_url,permalink` +
      `&limit=25` +
      `&access_token=${accessToken}`;

    if (pageToken) url += `&after=${pageToken}`;

    const res = await retryWithBackoff(() => fetch(url), { maxAttempts: 3, baseDelay: 1000 });
    const data = (await res.json()) as IgMediaListResponse;

    // Filter to VIDEO only — Instagram returns Reels as media_type === 'VIDEO'
    const videos: PlatformVideo[] = (data.data ?? [])
      .filter((m) => m.media_type === 'VIDEO')
      .map((m) => ({
        platformVideoId: m.id,
        title: (m.caption ?? '').slice(0, 200),
        description: m.caption ?? null,
        thumbnailUrl: m.thumbnail_url ?? null,
        duration: null, // Not available in the media list endpoint
        publishedAt: m.timestamp ? new Date(m.timestamp) : null,
        tags: [],
        privacyStatus: null,
      }));

    const nextPageToken = data.paging?.cursors?.after;
    return { videos, nextPageToken };
  }

  async fetchVideoStats(accessToken: string, platformVideoIds: string[]): Promise<VideoStats[]> {
    const allStats: VideoStats[] = [];

    // Instagram Insights API has no batch endpoint — one request per media ID.
    // Process 10 per batch with a 3s delay to stay within 200 calls/hour.
    for (let i = 0; i < platformVideoIds.length; i++) {
      if (i > 0 && i % 10 === 0) await delay(3000);

      const mediaId = platformVideoIds[i];

      try {
        const url =
          `${IG_BASE}/${mediaId}/insights` +
          `?metric=plays,likes,comments,shares,saved` +
          `&access_token=${accessToken}`;

        const res = await fetch(url);
        const data = (await res.json()) as IgInsightsResponse;

        // Insights may be unavailable for Reels published within the last 24-48h.
        // In that case the API returns an error — return zeros and retry next cycle.
        if (data.error) {
          allStats.push(buildZeroStats(mediaId));
          continue;
        }

        const metrics = new Map<string, number>();
        for (const m of data.data ?? []) {
          // Lifetime metrics use `values[0].value`; period metrics use `value` directly
          const val = m.value ?? m.values?.[0]?.value ?? 0;
          metrics.set(m.name, val);
        }

        allStats.push({
          platformVideoId: mediaId,
          viewCount: BigInt(metrics.get('plays') ?? 0),
          likeCount: BigInt(metrics.get('likes') ?? 0),
          commentCount: BigInt(metrics.get('comments') ?? 0),
          shareCount: BigInt(metrics.get('shares') ?? 0),
        });
      } catch {
        // Skip individual failures — new Reels may not have insights yet
        allStats.push(buildZeroStats(mediaId));
      }
    }

    return allStats;
  }
}

function buildZeroStats(platformVideoId: string): VideoStats {
  return {
    platformVideoId,
    viewCount: 0n,
    likeCount: 0n,
    commentCount: 0n,
    shareCount: 0n,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
