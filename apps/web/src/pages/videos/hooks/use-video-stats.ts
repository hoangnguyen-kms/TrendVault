import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface SuccessRes<T> { success: boolean; data: T }

export function useVideoDetail(videoId: string | undefined) {
  return useQuery({
    queryKey: ['video-detail', videoId],
    queryFn: async () => {
      const res = await apiClient.get<SuccessRes<Record<string, unknown>>>(`/videos/${videoId}`);
      return res.data;
    },
    enabled: !!videoId,
  });
}

export function useVideoStats(videoId: string | undefined, range: string) {
  return useQuery({
    queryKey: ['video-stats', videoId, range],
    queryFn: async () => {
      const res = await apiClient.get<SuccessRes<Record<string, unknown>>>(`/analytics/videos/${videoId}/stats?range=${range}`);
      return res.data;
    },
    enabled: !!videoId,
  });
}

export function useContentLifecycle(videoId: string | undefined) {
  return useQuery({
    queryKey: ['video-lifecycle', videoId],
    queryFn: async () => {
      const res = await apiClient.get<SuccessRes<Record<string, unknown>>>(`/analytics/videos/${videoId}/lifecycle`);
      return res.data;
    },
    enabled: !!videoId,
  });
}
