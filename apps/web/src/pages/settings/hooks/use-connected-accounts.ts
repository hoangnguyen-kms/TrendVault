import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface ChannelInfo {
  id: string;
  platform: string;
  platformChannelId: string;
  name: string;
  avatarUrl: string | null;
  subscriberCount: number | null;
  videoCount: number | null;
  isActive: boolean;
}

interface ConnectedAccountInfo {
  id: string;
  platform: string;
  platformUserId: string;
  displayName: string;
  avatarUrl: string | null;
  scopes: string[];
  tokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  channels: ChannelInfo[];
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export function useConnectedAccounts() {
  return useQuery({
    queryKey: ['connected-accounts'],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccess<ConnectedAccountInfo[]>>('/accounts');
      return response.data;
    },
  });
}

export function useDisconnectAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      await apiClient.delete(`/oauth/accounts/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccess<ChannelInfo[]>>('/channels');
      return response.data;
    },
  });
}
