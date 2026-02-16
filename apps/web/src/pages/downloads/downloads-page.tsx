import { AlertCircle, RefreshCw } from 'lucide-react';
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
          <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
          <p className="text-sm text-gray-500">Manage your downloaded videos</p>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-sm text-gray-500">
              {data.total} video{data.total !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
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
              <span className="text-sm text-gray-500">
                Page {data.page} of {Math.ceil(data.total / data.limit)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={!data.hasMore}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
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
        <div key={i} className="animate-pulse rounded-lg border bg-white p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-16 rounded bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-1/4 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-6 py-16">
      <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
      <p className="mb-1 text-lg font-medium text-gray-900">Failed to load downloads</p>
      <p className="mb-4 text-sm text-gray-500">{message ?? 'An unexpected error occurred'}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}
