import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  ApiSuccess,
  CrossChannelAggregate,
  ContentComparison,
} from '@trendvault/shared-types';

export type { CrossChannelAggregate, ContentComparison };

export function useCrossChannelAggregate() {
  return useQuery({
    queryKey: ['cross-channel-aggregate'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<CrossChannelAggregate>>(
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
      const res = await apiClient.get<ApiSuccess<ContentComparison[]>>(
        '/analytics/cross-channel/compare',
      );
      return res.data;
    },
  });
}
