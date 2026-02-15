import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, subscribeToJob, unsubscribeFromJob } from '@/lib/socket-client';
import type { DownloadProgressEvent } from '@trendvault/shared-types';

/** Subscribe to real-time download progress for a specific job */
export function useDownloadSocket(jobId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!jobId) return;
    const socket = getSocket();
    subscribeToJob(jobId);

    const onProgress = (data: DownloadProgressEvent) => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    };

    const onCompleted = () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    };

    const onFailed = () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    };

    socket.on('download:progress', onProgress);
    socket.on('download:completed', onCompleted);
    socket.on('download:failed', onFailed);

    return () => {
      unsubscribeFromJob(jobId);
      socket.off('download:progress', onProgress);
      socket.off('download:completed', onCompleted);
      socket.off('download:failed', onFailed);
    };
  }, [jobId, queryClient]);
}

/** Subscribe to all download events (for the downloads page) */
export function useDownloadSocketGlobal() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const onProgress = () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    };

    const onCompleted = () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    };

    const onFailed = () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    };

    socket.on('download:progress', onProgress);
    socket.on('download:completed', onCompleted);
    socket.on('download:failed', onFailed);

    return () => {
      socket.off('download:progress', onProgress);
      socket.off('download:completed', onCompleted);
      socket.off('download:failed', onFailed);
    };
  }, [queryClient]);
}
