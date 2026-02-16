import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface SuccessRes<T> {
  success: boolean;
  data: T;
}

export interface ChannelOverviewVideo {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  viewCount: number;
  likeCount: number;
  publishedAt: string | null;
}

export interface ChannelOverviewData {
  subscriberCount: number | null;
  totalViews: number | null;
  totalVideos: number;
  avgEngagementRate: number | null;
  recentVideos: ChannelOverviewVideo[];
}

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const res = await apiClient.get<SuccessRes<unknown[]>>('/channels');
      return res.data;
    },
  });
}

export function useChannelOverview(channelId: string | undefined) {
  return useQuery({
    queryKey: ['channel-overview', channelId],
    queryFn: async () => {
      const res = await apiClient.get<SuccessRes<ChannelOverviewData>>(
        `/analytics/channels/${channelId}/overview`,
      );
      return res.data;
    },
    enabled: !!channelId,
  });
}
