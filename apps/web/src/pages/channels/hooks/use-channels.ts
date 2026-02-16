import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface SuccessRes<T> {
  success: boolean;
  data: T;
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
      const res = await apiClient.get<SuccessRes<Record<string, unknown>>>(
        `/analytics/channels/${channelId}/overview`,
      );
      return res.data;
    },
    enabled: !!channelId,
  });
}
