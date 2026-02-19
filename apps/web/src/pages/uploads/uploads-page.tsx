import { Icon } from '@vibe/core';
import { Alert, Retry } from '@vibe/icons';
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
          <h1 style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
            Uploads
          </h1>
          <p style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}>
            Upload downloaded videos to YouTube, TikTok, or Instagram
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              {data.total} upload{data.total !== 1 ? 's' : ''}
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

      {/* YouTube quota warning */}
      {quota && quota.remainingUploads <= 1 && (
        <div
          className="mb-4 rounded-lg border px-4 py-3"
          style={{
            backgroundColor: 'var(--warning-color-selected)',
            borderColor: 'var(--warning-color)',
          }}
        >
          <div className="flex items-start gap-2">
            <Icon
              icon={Alert}
              iconSize={16}
              className="mt-0.5"
              style={{ color: 'var(--warning-color)' }}
            />
            <p style={{ font: 'var(--font-text2-normal)', color: 'var(--warning-color)' }}>
              YouTube quota: {quota.uploadsToday}/{quota.maxUploadsPerDay} uploads today (
              {quota.used.toLocaleString()}/{quota.limit.toLocaleString()} units used).
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
      <h2
        className="mb-3"
        style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}
      >
        Upload History
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border p-4"
              style={{
                backgroundColor: 'var(--primary-background-color)',
                borderColor: 'var(--ui-border-color)',
              }}
            >
              <div className="flex items-center gap-4">
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
      ) : isError ? (
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
            Failed to load uploads
          </p>
          <p
            className="mb-4"
            style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
          >
            {error?.message ?? 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => refetch()}
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
