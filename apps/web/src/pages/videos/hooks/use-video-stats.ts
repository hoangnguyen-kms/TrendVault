import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, StatsTimeSeries, ContentLifecycle } from '@trendvault/shared-types';

/** Matches GET /api/videos/:id response (PublishedVideo + channel include) */
export interface VideoDetail {
  id: string;
  channelId: string;
  uploadJobId: string | null;
  platform: string;
  platformVideoId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  privacyStatus: string | null;
  duration: number | null;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  lastStatsSyncAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  channel: {
    id: string;
    name: string;
    platform: string;
    avatarUrl: string | null;
  };
}

export function useVideoDetail(videoId: string | undefined) {
  return useQuery({
    queryKey: ['video-detail', videoId],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<VideoDetail>>(`/videos/${videoId}`);
      return res.data;
    },
    enabled: !!videoId,
  });
}

export function useVideoStats(videoId: string | undefined, range: string) {
  return useQuery({
    queryKey: ['video-stats', videoId, range],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<StatsTimeSeries>>(
        `/analytics/videos/${videoId}/stats?range=${range}`,
      );
      return res.data;
    },
    enabled: !!videoId,
  });
}

export function useContentLifecycle(videoId: string | undefined) {
  return useQuery({
    queryKey: ['video-lifecycle', videoId],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<ContentLifecycle>>(
        `/analytics/videos/${videoId}/lifecycle`,
      );
      return res.data;
    },
    enabled: !!videoId,
  });
}
