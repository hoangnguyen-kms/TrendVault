import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useTrendingFilters } from './use-trending-filters';
import type { PaginatedTrendingResponse } from '@trendvault/shared-types';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export function useTrendingVideos() {
  const { platform, region, category, autoRefresh, refreshInterval, contentType } =
    useTrendingFilters();

  return useInfiniteQuery({
    queryKey: ['trending', platform, region, category, contentType],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        platform,
        region,
        page: String(pageParam),
        limit: '20',
        contentType,
      });
      if (category) params.set('category', category);

      const response = await apiClient.get<ApiSuccess<PaginatedTrendingResponse>>(
        `/trending?${params.toString()}`,
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

interface RegionsResponse {
  regions: Array<{ code: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}

export function useSupportedRegions() {
  return useQuery({
    queryKey: ['trending-regions'],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccess<RegionsResponse>>('/trending/regions');
      return response.data;
    },
    staleTime: Infinity, // static data
  });
}
