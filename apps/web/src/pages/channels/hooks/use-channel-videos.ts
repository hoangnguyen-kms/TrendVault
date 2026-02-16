import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface VideoListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: string;
}

interface PaginatedResult {
  data: Record<string, unknown>[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface SuccessRes<T> {
  success: boolean;
  data: T;
}

export function useChannelVideos(channelId: string | undefined, query: VideoListQuery) {
  return useQuery({
    queryKey: ['channel-videos', channelId, query],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(query.page),
        limit: String(query.limit),
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });
      if (query.search) params.set('search', query.search);
      const res = await apiClient.get<SuccessRes<PaginatedResult>>(
        `/analytics/channels/${channelId}/videos?${params}`,
      );
      return res.data;
    },
    enabled: !!channelId,
  });
}
