import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { User, ApiSuccess } from '@trendvault/shared-types';

export function useAcceptTos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient.patch<ApiSuccess<User>>('/auth/accept-tos');
    },
    onSuccess: (response) => {
      // Server returns the updated user; set directly so the ToS modal
      // closes in the same render without a redundant /auth/me roundtrip
      queryClient.setQueryData(['user'], response.data);
    },
  });
}
