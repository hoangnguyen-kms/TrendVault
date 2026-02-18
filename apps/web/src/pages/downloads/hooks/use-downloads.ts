import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import type {
  PaginatedDownloadsResponse,
  DownloadedVideo,
  ApiSuccess,
} from '@trendvault/shared-types';
import { useState } from 'react';

interface DownloadFilters {
  platform: string;
  status: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}

const defaultFilters: DownloadFilters = {
  platform: 'ALL',
  status: 'ALL',
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function useDownloads(overrides?: Partial<DownloadFilters>) {
  const filters = { ...defaultFilters, ...overrides };
  const params = new URLSearchParams({
    platform: filters.platform,
    status: filters.status,
    page: String(filters.page),
    limit: String(filters.limit),
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  return useQuery({
    queryKey: ['downloads', filters],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccess<PaginatedDownloadsResponse>>(
        `/downloads?${params.toString()}`,
      );
      return response.data;
    },
    refetchInterval: 5000, // Poll active downloads
  });
}

export function useQueueDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trendingVideoId: string) => {
      const response = await apiClient.post<ApiSuccess<{ id: string; bullmqJobId: string }>>(
        '/downloads',
        { trendingVideoId },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      toast.success('Download queued');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to queue download');
    },
  });
}

export function useBatchDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trendingVideoIds: string[]) => {
      const response = await apiClient.post<ApiSuccess<unknown[]>>('/downloads/batch', {
        trendingVideoIds,
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      toast.success(`${variables.length} download${variables.length > 1 ? 's' : ''} queued`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to queue downloads');
    },
  });
}

export function useRetryDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (downloadId: string) => {
      const response = await apiClient.post<ApiSuccess<unknown>>(`/downloads/${downloadId}/retry`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      toast.success('Download retry queued');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to retry download');
    },
  });
}

export function useDeleteDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (downloadId: string) => {
      await apiClient.delete(`/downloads/${downloadId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      toast.success('Download deleted');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete download');
    },
  });
}

export function useDownloadUrl(downloadId: string) {
  return useQuery({
    queryKey: ['download-url', downloadId],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccess<{ url: string }>>(
        `/downloads/${downloadId}/url`,
      );
      return response.data.url;
    },
    enabled: false, // Only fetch on demand
  });
}

export function useDownloadFilters() {
  const [filters, setFilters] = useState<DownloadFilters>(defaultFilters);

  const updateFilter = (key: keyof DownloadFilters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset page when filters change
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  };

  return { filters, updateFilter, setFilters };
}
