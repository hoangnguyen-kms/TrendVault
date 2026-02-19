import { Icon } from '@vibe/core';
import { Alert, Retry } from '@vibe/icons';
import { DownloadFilters } from './components/download-filters';
import { DownloadHistoryTable } from './components/download-history-table';
import {
  useDownloads,
  useRetryDownload,
  useDeleteDownload,
  useDownloadFilters,
} from './hooks/use-downloads';

export default function DownloadsPage() {
  const { filters, updateFilter } = useDownloadFilters();
  const { data, isLoading, isError, error, refetch } = useDownloads(filters);
  const retryMutation = useRetryDownload();
  const deleteMutation = useDeleteDownload();

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
            Downloads
          </h1>
          <p style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}>
            Manage your downloaded videos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              {data.total} video{data.total !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-md border px-3 py-2 transition-colors"
            style={{
              font: 'var(--font-text2-medium)',
              borderColor: 'var(--ui-border-color)',
              backgroundColor: 'var(--primary-background-color)',
              color: 'var(--secondary-text-color)',
              boxShadow: 'var(--box-shadow-xs)',
            }}
          >
            <Icon icon={Retry} iconSize={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <DownloadFilters
          platform={filters.platform}
          status={filters.status}
          onPlatformChange={(v) => updateFilter('platform', v)}
          onStatusChange={(v) => updateFilter('status', v)}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : (
        <>
          <DownloadHistoryTable
            downloads={data?.data ?? []}
            onRetry={(id) => retryMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
            isRetrying={retryMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />

          {/* Pagination */}
          {data && data.total > data.limit && (
            <div className="mt-4 flex items-center justify-between">
              <span
                style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
              >
                Page {data.page} of {Math.ceil(data.total / data.limit)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="rounded-md border px-3 py-1.5 disabled:opacity-50"
                  style={{
                    font: 'var(--font-text2-normal)',
                    borderColor: 'var(--ui-border-color)',
                    color: 'var(--primary-text-color)',
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={!data.hasMore}
                  className="rounded-md border px-3 py-1.5 disabled:opacity-50"
                  style={{
                    font: 'var(--font-text2-normal)',
                    borderColor: 'var(--ui-border-color)',
                    color: 'var(--primary-text-color)',
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border p-4"
          style={{
            backgroundColor: 'var(--primary-background-color)',
            borderColor: 'var(--ui-border-color)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="h-10 w-16 rounded"
              style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.2 }}
            />
            <div className="flex-1 space-y-2">
              <div
                className="h-4 w-1/3 rounded"
                style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.2 }}
              />
              <div
                className="h-3 w-1/4 rounded"
                style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.2 }}
              />
            </div>
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
        Failed to load downloads
      </p>
      <p
        className="mb-4"
        style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
      >
        {message ?? 'An unexpected error occurred'}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-md px-4 py-2"
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
