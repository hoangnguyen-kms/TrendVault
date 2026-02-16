import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface SuccessRes<T> {
  success: boolean;
  data: T;
}

export interface VideoDetail {
  id: string;
  title: string;
  platform: string;
  channelId: string | null;
  channelName: string | null;
  thumbnailUrl: string | null;
  platformVideoId: string | null;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  shareCount: number | null;
  publishedAt: string | null;
  duration: number | null;
  privacyStatus: string | null;
  description: string | null;
  tags: string[] | null;
}

export interface VideoStatsTimeSeries {
  labels: string[];
  views: number[];
  likes: number[];
  comments: number[];
  shares: number[];
}

export interface ContentLifecycle {
  trending: {
    id: string;
    platform: string;
    title: string;
    viewCount: number | null;
    region: string;
    fetchedAt: string;
  } | null;
  download: { id: string; status: string; downloadedAt: string | null } | null;
  upload: { id: string; status: string; uploadedAt: string | null } | null;
  published: {
    id: string;
    platform: string;
    title: string;
    viewCount: number | null;
    likeCount: number | null;
    publishedAt: string | null;
  };
}

export function useVideoDetail(videoId: string | undefined) {
  return useQuery({
    queryKey: ['video-detail', videoId],
    queryFn: async () => {
      const res = await apiClient.get<SuccessRes<VideoDetail>>(`/videos/${videoId}`);
      return res.data;
    },
    enabled: !!videoId,
  });
}

export function useVideoStats(videoId: string | undefined, range: string) {
  return useQuery({
    queryKey: ['video-stats', videoId, range],
    queryFn: async () => {
      const res = await apiClient.get<SuccessRes<VideoStatsTimeSeries>>(
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
      const res = await apiClient.get<SuccessRes<ContentLifecycle>>(
        `/analytics/videos/${videoId}/lifecycle`,
      );
      return res.data;
    },
    enabled: !!videoId,
  });
}
