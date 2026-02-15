import { Platform, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma-client.js';
import { trendingCache } from './trending-cache.js';
import type { IPlatformAdapter, TrendingVideoDTO } from './adapters/platform-adapter.interface.js';
import type { TrendingQuery } from '@trendvault/shared-types';

// TTLs in seconds
const YOUTUBE_CACHE_TTL = 1800; // 30 min
const TIKTOK_CACHE_TTL = 900; // 15 min
const ALL_CACHE_TTL = 900; // 15 min (limited by shortest platform TTL)

export class TrendingService {
  private adapters: Map<Platform, IPlatformAdapter>;

  constructor(adapters: IPlatformAdapter[]) {
    this.adapters = new Map(adapters.map((a) => [a.platform, a]));
  }

  async getTrending(params: TrendingQuery) {
    const { platform, region, category, page, limit } = params;
    const cacheKey = `${platform}:${region}:${category ?? 'all'}:${page}:${limit}`;

    // 1. Check cache
    const cached = await trendingCache.get<CachedTrendingPage>(cacheKey);
    if (cached) return cached;

    // 2. Determine which adapters to call
    const adaptersToUse =
      platform === 'ALL'
        ? [...this.adapters.values()]
        : [this.adapters.get(platform as Platform)].filter(
            (a): a is IPlatformAdapter => Boolean(a),
          );

    // 3. Check adapter availability, then fetch (parallel, graceful on failure)
    const availableAdapters = (
      await Promise.all(
        adaptersToUse.map(async (a) => ((await a.isAvailable()) ? a : null)),
      )
    ).filter((a): a is IPlatformAdapter => a !== null);

    const results = await Promise.allSettled(
      availableAdapters.map((adapter) =>
        adapter.fetchTrending({ region, category: category ?? undefined, maxResults: limit }),
      ),
    );

    // 4. Merge + sort by view count descending
    const allVideos: TrendingVideoDTO[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allVideos.push(...result.value.videos);
      }
    }

    allVideos.sort((a, b) => {
      const aViews = Number(a.viewCount ?? 0n);
      const bViews = Number(b.viewCount ?? 0n);
      return bViews - aViews;
    });

    // 5. Paginate with proper offset
    const offset = (page - 1) * limit;
    const paginatedVideos = allVideos.slice(offset, offset + limit);

    // 6. Upsert to DB and get IDs for the response
    const idMap = await this.upsertVideos(allVideos);

    // 7. Format response (include DB id for download actions)
    const response: CachedTrendingPage = {
      data: paginatedVideos.map((v) => serializeVideo(v, idMap)),
      page,
      limit,
      total: allVideos.length,
      hasMore: offset + limit < allVideos.length,
    };

    // 8. Cache
    const ttl =
      platform === 'TIKTOK'
        ? TIKTOK_CACHE_TTL
        : platform === 'YOUTUBE'
          ? YOUTUBE_CACHE_TTL
          : ALL_CACHE_TTL;
    await trendingCache.set(cacheKey, response, ttl);

    return response;
  }

  async getTrendingVideoById(id: string) {
    const video = await prisma.trendingVideo.findUnique({ where: { id } });
    if (!video) return null;
    return {
      ...video,
      viewCount: video.viewCount ? Number(video.viewCount) : null,
      likeCount: video.likeCount ? Number(video.likeCount) : null,
      commentCount: video.commentCount ? Number(video.commentCount) : null,
      shareCount: video.shareCount ? Number(video.shareCount) : null,
      publishedAt: video.publishedAt?.toISOString() ?? null,
      fetchedAt: video.fetchedAt.toISOString(),
    };
  }

  /** Used by BullMQ worker to refresh cache for a specific platform+region */
  async refreshTrending(platform: Platform, region: string): Promise<void> {
    const adapter = this.adapters.get(platform);
    if (!adapter || !(await adapter.isAvailable())) return;

    const lockKey = `refresh:${platform}:${region}`;
    const acquired = await trendingCache.acquireLock(lockKey);
    if (!acquired) return; // Another worker is already refreshing

    try {
      const result = await adapter.fetchTrending({ region, maxResults: 20 });
      if (result.videos.length > 0) {
        const idMap = await this.upsertVideos(result.videos);
        // Warm the "page 1" cache
        const cacheKey = `${platform}:${region}:all:1:20`;
        const response: CachedTrendingPage = {
          data: result.videos.map((v) => serializeVideo(v, idMap)),
          page: 1,
          limit: 20,
          total: result.videos.length,
          hasMore: result.videos.length >= 20,
        };
        const ttl = platform === Platform.TIKTOK ? TIKTOK_CACHE_TTL : YOUTUBE_CACHE_TTL;
        await trendingCache.set(cacheKey, response, ttl);
      }
    } finally {
      await trendingCache.releaseLock(lockKey);
    }
  }

  /** Upserts videos and returns a composite-key → id map */
  private async upsertVideos(videos: TrendingVideoDTO[]): Promise<Map<string, string>> {
    const idMap = new Map<string, string>();
    if (videos.length === 0) return idMap;

    const records = await prisma.$transaction(
      videos.map((v) =>
        prisma.trendingVideo.upsert({
          where: {
            platform_platformVideoId_region: {
              platform: v.platform,
              platformVideoId: v.platformVideoId,
              region: v.region,
            },
          },
          update: {
            title: v.title,
            description: v.description,
            thumbnailUrl: v.thumbnailUrl,
            viewCount: v.viewCount,
            likeCount: v.likeCount,
            commentCount: v.commentCount,
            shareCount: v.shareCount,
            trendingRank: v.trendingRank,
            fetchedAt: new Date(),
          },
          create: {
            platform: v.platform,
            platformVideoId: v.platformVideoId,
            region: v.region,
            title: v.title,
            description: v.description,
            thumbnailUrl: v.thumbnailUrl,
            channelName: v.channelName,
            channelId: v.channelId,
            duration: v.duration,
            viewCount: v.viewCount,
            likeCount: v.likeCount,
            commentCount: v.commentCount,
            shareCount: v.shareCount,
            publishedAt: v.publishedAt,
            trendingRank: v.trendingRank,
            category: v.category,
            tags: v.tags,
            rawMetadata: v.rawMetadata
              ? (v.rawMetadata as Prisma.InputJsonValue)
              : Prisma.JsonNull,
          },
        }),
      ),
    );

    for (const r of records) {
      idMap.set(`${r.platform}:${r.platformVideoId}:${r.region}`, r.id);
    }
    return idMap;
  }
}

// --- Helpers ---

function serializeVideo(v: TrendingVideoDTO, idMap: Map<string, string>) {
  return {
    id: idMap.get(`${v.platform}:${v.platformVideoId}:${v.region}`) ?? null,
    platform: v.platform,
    platformVideoId: v.platformVideoId,
    region: v.region,
    title: v.title,
    description: v.description,
    thumbnailUrl: v.thumbnailUrl,
    channelName: v.channelName,
    channelId: v.channelId,
    duration: v.duration,
    viewCount: v.viewCount != null ? Number(v.viewCount) : null,
    likeCount: v.likeCount != null ? Number(v.likeCount) : null,
    commentCount: v.commentCount != null ? Number(v.commentCount) : null,
    shareCount: v.shareCount != null ? Number(v.shareCount) : null,
    publishedAt: v.publishedAt?.toISOString() ?? null,
    trendingRank: v.trendingRank,
    category: v.category,
    tags: v.tags,
    fetchedAt: new Date().toISOString(),
  };
}

interface CachedTrendingPage {
  data: ReturnType<typeof serializeVideo>[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
