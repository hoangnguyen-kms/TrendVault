import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import type {
  PaginatedUploadsResponse,
  CreateUploadRequest,
  YouTubeQuotaInfo,
  ApiSuccess,
} from '@trendvault/shared-types';

interface UploadFilters {
  platform: string;
  status: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}

const defaultFilters: UploadFilters = {
  platform: 'ALL',
  status: 'ALL',
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function useUploads(overrides?: Partial<UploadFilters>) {
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
    queryKey: ['uploads', filters],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccess<PaginatedUploadsResponse>>(
        `/uploads?${params.toString()}`,
      );
      return response.data;
    },
    refetchInterval: 5000,
  });
}

export function useCreateUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUploadRequest) => {
      const response = await apiClient.post<ApiSuccess<{ id: string; bullmqJobId: string }>>(
        '/uploads',
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
    },
  });
}

export function useRetryUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uploadId: string) => {
      const response = await apiClient.post<ApiSuccess<unknown>>(`/uploads/${uploadId}/retry`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
    },
  });
}

export function useCancelUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uploadId: string) => {
      await apiClient.delete(`/uploads/${uploadId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
    },
  });
}

export function useYouTubeQuota() {
  return useQuery({
    queryKey: ['youtube-quota'],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccess<YouTubeQuotaInfo>>('/uploads/quota');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useUploadFilters() {
  const [filters, setFilters] = useState<UploadFilters>(defaultFilters);

  const updateFilter = (key: keyof UploadFilters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  };

  return { filters, updateFilter, setFilters };
}
