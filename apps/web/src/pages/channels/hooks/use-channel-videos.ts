import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, VideoLibraryQuery } from '@trendvault/shared-types';

interface PublishedVideoSummary {
  id: string;
  title: string;
  platform: string;
  thumbnailUrl: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
  isShort: boolean;
}

interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export function useChannelVideos(channelId: string | undefined, query: VideoLibraryQuery) {
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
      const res = await apiClient.get<ApiSuccess<PaginatedResult<PublishedVideoSummary>>>(
        `/analytics/channels/${channelId}/videos?${params}`,
      );
      return res.data;
    },
    enabled: !!channelId,
  });
}
