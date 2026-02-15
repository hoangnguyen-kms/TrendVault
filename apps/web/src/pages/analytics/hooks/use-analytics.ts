import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface SuccessRes<T> { success: boolean; data: T }

export function useCrossChannelAggregate() {
  return useQuery({
    queryKey: ['cross-channel-aggregate'],
    queryFn: async () => {
      const res = await apiClient.get<SuccessRes<Record<string, unknown>>>('/analytics/cross-channel');
      return res.data;
    },
  });
}

export function useCrossChannelComparison() {
  return useQuery({
    queryKey: ['cross-channel-comparison'],
    queryFn: async () => {
      const res = await apiClient.get<SuccessRes<unknown[]>>('/analytics/cross-channel/compare');
      return res.data;
    },
  });
}
