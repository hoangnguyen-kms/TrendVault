import { AlertCircle, RefreshCw } from 'lucide-react';
import { UploadForm } from './components/upload-form';
import { UploadHistoryTable } from './components/upload-history-table';
import { useUploads, useRetryUpload, useCancelUpload, useYouTubeQuota } from './hooks/use-uploads';

export default function UploadsPage() {
  const { data, isLoading, isError, error, refetch } = useUploads();
  const retryMutation = useRetryUpload();
  const cancelMutation = useCancelUpload();
  const { data: quota } = useYouTubeQuota();

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Uploads</h1>
          <p className="text-sm text-gray-500">
            Upload downloaded videos to YouTube or TikTok
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-sm text-gray-500">
              {data.total} upload{data.total !== 1 ? 's' : ''}
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

      {/* YouTube quota warning */}
      {quota && quota.remainingUploads <= 1 && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              YouTube quota: {quota.uploadsToday}/{quota.maxUploadsPerDay} uploads today
              ({quota.used.toLocaleString()}/{quota.limit.toLocaleString()} units used).
              {quota.remainingUploads === 0
                ? ' Limit reached — uploads resume tomorrow.'
                : ` ${quota.remainingUploads} upload remaining.`}
            </p>
          </div>
        </div>
      )}

      {/* Upload form */}
      <div className="mb-6">
        <UploadForm onSuccess={() => refetch()} />
      </div>

      {/* Upload history */}
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Upload History</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-white p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/4 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-6 py-16">
          <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
          <p className="mb-1 text-lg font-medium text-gray-900">Failed to load uploads</p>
          <p className="mb-4 text-sm text-gray-500">{error?.message ?? 'An unexpected error occurred'}</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : (
        <UploadHistoryTable
          uploads={data?.data ?? []}
          onRetry={(id) => retryMutation.mutate(id)}
          onCancel={(id) => cancelMutation.mutate(id)}
          isRetrying={retryMutation.isPending}
          isCancelling={cancelMutation.isPending}
        />
      )}
    </div>
  );
}
