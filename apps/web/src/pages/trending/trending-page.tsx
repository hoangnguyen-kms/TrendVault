import { useCallback, useEffect, useRef } from 'react';
import { Icon, Loader } from '@vibe/core';
import { Alert, Retry } from '@vibe/icons';
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
          <h1 style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
            Trending Videos
          </h1>
          <p style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}>
            Discover what's trending on YouTube, TikTok, and Instagram
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
            {isFetchingNextPage && <Loader size={Loader.sizes?.SMALL} />}
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
          className="animate-pulse rounded-lg border overflow-hidden"
          style={{
            backgroundColor: 'var(--primary-background-color)',
            borderColor: 'var(--ui-border-color)',
          }}
        >
          <div
            className="aspect-video"
            style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.2 }}
          />
          <div className="p-3 space-y-2">
            <div
              className="h-4 w-3/4 rounded"
              style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.2 }}
            />
            <div
              className="h-3 w-1/2 rounded"
              style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.2 }}
            />
            <div
              className="h-3 w-2/3 rounded"
              style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.2 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border px-6 py-16"
      style={{
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--ui-border-color)',
      }}
    >
      <Icon
        icon={Alert}
        iconSize={40}
        className="mb-3"
        style={{ color: 'var(--negative-color)' }}
      />
      <p
        className="mb-1"
        style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}
      >
        Failed to load trending videos
      </p>
      <p
        className="mb-4"
        style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
      >
        {message ?? 'An unexpected error occurred'}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
        style={{
          font: 'var(--font-text2-medium)',
          backgroundColor: 'var(--primary-color)',
          color: 'var(--text-color-on-primary)',
        }}
      >
        <Icon icon={Retry} iconSize={16} />
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border px-6 py-16"
      style={{
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--ui-border-color)',
      }}
    >
      <p
        className="mb-1"
        style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}
      >
        No trending videos found
      </p>
      <p style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}>
        Try changing the platform, region, or category filter
      </p>
    </div>
  );
}
