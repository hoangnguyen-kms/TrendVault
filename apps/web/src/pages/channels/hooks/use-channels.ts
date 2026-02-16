import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, ChannelOverview, Channel } from '@trendvault/shared-types';

export type { ChannelOverview };

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Channel[]>>('/channels');
      return res.data;
    },
  });
}

export function useChannelOverview(channelId: string | undefined) {
  return useQuery({
    queryKey: ['channel-overview', channelId],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<ChannelOverview>>(
        `/analytics/channels/${channelId}/overview`,
      );
      return res.data;
    },
    enabled: !!channelId,
  });
}
