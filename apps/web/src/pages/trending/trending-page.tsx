import { useCallback, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { TrendingFilters } from './components/trending-filters';
import { TrendingAutoRefresh } from './components/trending-auto-refresh';
import { TrendingVideoCard } from './components/trending-video-card';
import { useTrendingVideos } from './hooks/use-trending-videos';

export default function TrendingPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useTrendingVideos();

  // Infinite scroll via Intersection Observer
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  const allVideos = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trending Videos</h1>
          <p className="text-sm text-gray-500">
            Discover what's trending on YouTube and TikTok
          </p>
        </div>
        <TrendingAutoRefresh />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TrendingFilters />
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : allVideos.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allVideos.map((video) => (
              <TrendingVideoCard
                key={`${video.platform}-${video.platformVideoId}-${video.region}`}
                video={video}
              />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="mt-6 flex justify-center py-4">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border bg-white overflow-hidden"
        >
          <div className="aspect-video bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-3 w-2/3 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-6 py-16">
      <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
      <p className="mb-1 text-lg font-medium text-gray-900">
        Failed to load trending videos
      </p>
      <p className="mb-4 text-sm text-gray-500">
        {message ?? 'An unexpected error occurred'}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-6 py-16">
      <p className="mb-1 text-lg font-medium text-gray-900">No trending videos found</p>
      <p className="text-sm text-gray-500">
        Try changing the platform, region, or category filter
      </p>
    </div>
  );
}
