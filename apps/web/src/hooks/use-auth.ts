import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { User, ApiSuccess } from '@trendvault/shared-types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiSuccess<User>>('/auth/me');
        return response.data;
      } catch {
        return null;
      }
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return apiClient.post<ApiSuccess<User>>('/auth/login', credentials);
    },
    onSuccess: (response) => {
      // Immediately populate the cache so RootLayout sees the user without
      // waiting for a refetch (avoids redirect back to /login on stale null cache)
      queryClient.setQueryData(['user'], response.data);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      return apiClient.post<ApiSuccess<User>>('/auth/register', data);
    },
    onSuccess: (response) => {
      queryClient.setQueryData(['user'], response.data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient.post<{ message: string }>('/auth/logout');
    },
    onSuccess: () => {
      // Clear synchronously so RootLayout redirects to /login in the same render
      queryClient.setQueryData(['user'], null);
    },
  });
}
