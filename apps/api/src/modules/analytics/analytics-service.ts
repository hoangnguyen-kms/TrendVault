import { prisma } from '../../lib/prisma-client.js';
import type { VideoListQuery } from './analytics-schemas.js';

export class AnalyticsService {
  async getChannelOverview(channelId: string, userId: string) {
    const channel = await prisma.channel.findFirst({
      where: { id: channelId, connectedAccount: { userId } },
    });
    if (!channel) throw new Error('Channel not found');

    const recentVideos = await prisma.publishedVideo.findMany({
      where: { channelId },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        viewCount: true,
        likeCount: true,
        publishedAt: true,
      },
    });

    const agg = await prisma.publishedVideo.aggregate({
      where: { channelId },
      _sum: { viewCount: true, likeCount: true, commentCount: true },
      _count: true,
    });

    const totalViews = Number(agg._sum.viewCount ?? 0);
    const totalLikes = Number(agg._sum.likeCount ?? 0);
    const totalComments = Number(agg._sum.commentCount ?? 0);
    const avgEngagement = totalViews > 0 ? (totalLikes + totalComments) / totalViews : null;

    return {
      channelId: channel.id,
      channelName: channel.name,
      platform: channel.platform,
      subscriberCount: channel.subscriberCount ? Number(channel.subscriberCount) : null,
      totalViews: channel.totalViews ? Number(channel.totalViews) : null,
      totalVideos: agg._count,
      totalLikes,
      totalComments,
      avgEngagementRate: avgEngagement,
      recentVideos: recentVideos.map((v) => ({
        id: v.id,
        title: v.title,
        thumbnailUrl: v.thumbnailUrl,
        viewCount: Number(v.viewCount ?? 0),
        likeCount: Number(v.likeCount ?? 0),
        publishedAt: v.publishedAt?.toISOString() ?? null,
      })),
    };
  }

  async getVideoStats(videoId: string, userId: string, dateRange: { from: Date; to: Date }) {
    const video = await prisma.publishedVideo.findFirst({
      where: { id: videoId, channel: { connectedAccount: { userId } } },
    });
    if (!video) throw new Error('Video not found');

    const snapshots = await prisma.videoStatsSnapshot.findMany({
      where: {
        publishedVideoId: videoId,
        snapshotAt: { gte: dateRange.from, lte: dateRange.to },
      },
      orderBy: { snapshotAt: 'asc' },
    });

    return {
      labels: snapshots.map((s) => s.snapshotAt.toISOString()),
      views: snapshots.map((s) => Number(s.viewCount)),
      likes: snapshots.map((s) => Number(s.likeCount)),
      comments: snapshots.map((s) => Number(s.commentCount)),
      shares: snapshots.map((s) => Number(s.shareCount)),
      engagementRates: snapshots.map((s) => s.engagementRate),
    };
  }

  async getContentLifecycle(videoId: string, userId: string) {
    const video = await prisma.publishedVideo.findFirst({
      where: { id: videoId, channel: { connectedAccount: { userId } } },
      include: {
        uploadJob: {
          include: {
            downloadedVideo: { include: { trendingVideo: true } },
          },
        },
      },
    });
    if (!video) throw new Error('Video not found');

    const tv = video.uploadJob?.downloadedVideo?.trendingVideo;
    const dv = video.uploadJob?.downloadedVideo;
    const uj = video.uploadJob;

    return {
      trending: tv
        ? {
            id: tv.id,
            platform: tv.platform,
            title: tv.title,
            viewCount: tv.viewCount ? Number(tv.viewCount) : null,
            region: tv.region,
            fetchedAt: tv.fetchedAt.toISOString(),
          }
        : null,
      download: dv
        ? {
            id: dv.id,
            status: dv.status,
            downloadedAt: dv.downloadedAt?.toISOString() ?? null,
          }
        : null,
      upload: uj
        ? {
            id: uj.id,
            status: uj.status,
            uploadedAt: uj.uploadedAt?.toISOString() ?? null,
          }
        : null,
      published: {
        id: video.id,
        platform: video.platform,
        platformVideoId: video.platformVideoId,
        title: video.title,
        viewCount: video.viewCount ? Number(video.viewCount) : null,
        likeCount: video.likeCount ? Number(video.likeCount) : null,
        publishedAt: video.publishedAt?.toISOString() ?? null,
      },
    };
  }

  async getCrossChannelAggregate(userId: string) {
    const channels = await prisma.channel.findMany({
      where: { connectedAccount: { userId }, isActive: true },
      include: {
        _count: { select: { publishedVideos: true } },
      },
    });

    const videoAgg = await prisma.publishedVideo.aggregate({
      where: { channel: { connectedAccount: { userId } } },
      _sum: { viewCount: true, likeCount: true, commentCount: true },
      _count: true,
    });

    const platformMap = new Map<
      string,
      { channels: number; videos: number; views: bigint; likes: bigint }
    >();
    for (const ch of channels) {
      const entry = platformMap.get(ch.platform) ?? {
        channels: 0,
        videos: 0,
        views: 0n,
        likes: 0n,
      };
      entry.channels++;
      entry.videos += ch._count.publishedVideos;
      platformMap.set(ch.platform, entry);
    }

    // Get per-platform video stats
    for (const [platform, entry] of platformMap) {
      const agg = await prisma.publishedVideo.aggregate({
        where: {
          channel: { connectedAccount: { userId }, platform: platform as 'YOUTUBE' | 'TIKTOK' },
        },
        _sum: { viewCount: true, likeCount: true },
      });
      entry.views = agg._sum.viewCount ?? 0n;
      entry.likes = agg._sum.likeCount ?? 0n;
    }

    return {
      totalChannels: channels.length,
      totalVideos: videoAgg._count,
      totalViews: Number(videoAgg._sum.viewCount ?? 0),
      totalLikes: Number(videoAgg._sum.likeCount ?? 0),
      totalComments: Number(videoAgg._sum.commentCount ?? 0),
      platformBreakdown: Array.from(platformMap.entries()).map(([platform, d]) => ({
        platform,
        channels: d.channels,
        videos: d.videos,
        views: Number(d.views),
        likes: Number(d.likes),
      })),
    };
  }

  async getCrossChannelComparison(userId: string) {
    // Find videos that share the same downloadedVideo source
    const results = await prisma.publishedVideo.findMany({
      where: { channel: { connectedAccount: { userId } }, uploadJob: { isNot: null } },
      include: {
        channel: { select: { name: true } },
        uploadJob: {
          select: { downloadedVideo: { select: { id: true, title: true, platform: true } } },
        },
      },
    });

    const groups = new Map<
      string,
      { sourceTitle: string; sourcePlatform: string; versions: typeof results }
    >();
    for (const r of results) {
      const dvId = r.uploadJob?.downloadedVideo?.id;
      if (!dvId) continue;
      const group = groups.get(dvId) ?? {
        sourceTitle: r.uploadJob!.downloadedVideo!.title,
        sourcePlatform: r.uploadJob!.downloadedVideo!.platform,
        versions: [],
      };
      group.versions.push(r);
      groups.set(dvId, group);
    }

    // Only return entries with 2+ published versions
    return Array.from(groups.values())
      .filter((g) => g.versions.length >= 2)
      .map((g) => ({
        sourceTitle: g.sourceTitle,
        sourcePlatform: g.sourcePlatform,
        publishedVersions: g.versions.map((v) => ({
          publishedVideoId: v.id,
          channelName: v.channel.name,
          platform: v.platform,
          viewCount: Number(v.viewCount ?? 0),
          likeCount: Number(v.likeCount ?? 0),
          commentCount: Number(v.commentCount ?? 0),
        })),
      }));
  }

  async getChannelVideos(channelId: string, userId: string, query: VideoListQuery) {
    const channel = await prisma.channel.findFirst({
      where: { id: channelId, connectedAccount: { userId } },
    });
    if (!channel) throw new Error('Channel not found');

    const where = {
      channelId,
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' as const } } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.publishedVideo.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.publishedVideo.count({ where }),
    ]);

    return {
      data: data.map((v) => ({
        ...v,
        viewCount: Number(v.viewCount ?? 0),
        likeCount: Number(v.likeCount ?? 0),
        commentCount: Number(v.commentCount ?? 0),
        shareCount: Number(v.shareCount ?? 0),
      })),
      page: query.page,
      limit: query.limit,
      total,
      hasMore: query.page * query.limit < total,
    };
  }
}

export const analyticsService = new AnalyticsService();
