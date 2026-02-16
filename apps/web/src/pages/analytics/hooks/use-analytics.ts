import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface SuccessRes<T> {
  success: boolean;
  data: T;
}

export interface CrossChannelAggregate {
  totalChannels: number;
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  platforms?: string[];
  platformBreakdown?: Array<{
    platform: string;
    views: number;
    likes: number;
    videos: number;
  }>;
}

export interface CrossChannelComparison {
  sourceTitle: string;
  sourcePlatform: string;
  publishedVersions: Array<{
    publishedVideoId: string;
    channelName: string;
    platform: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
  }>;
}

export function useCrossChannelAggregate() {
  return useQuery({
    queryKey: ['cross-channel-aggregate'],
    queryFn: async () => {
      const res = await apiClient.get<SuccessRes<CrossChannelAggregate>>(
        '/analytics/cross-channel',
      );
      return res.data;
    },
  });
}

export function useCrossChannelComparison() {
  return useQuery({
    queryKey: ['cross-channel-comparison'],
    queryFn: async () => {
      const res = await apiClient.get<SuccessRes<CrossChannelComparison[]>>(
        '/analytics/cross-channel/compare',
      );
      return res.data;
    },
  });
}
