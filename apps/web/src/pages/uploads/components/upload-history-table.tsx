import {
  RotateCcw,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Upload,
} from 'lucide-react';
import type { UploadJob } from '@trendvault/shared-types';

interface UploadHistoryTableProps {
  uploads: UploadJob[];
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  isRetrying: boolean;
  isCancelling: boolean;
}

function UploadStatusBadge({ status, progress }: { status: string; progress: number }) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700">
          <Clock className="h-3 w-3" /> Pending
        </span>
      );
    case 'UPLOADING':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
          <Loader2 className="h-3 w-3 animate-spin" /> {progress}%
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700">
          <Loader2 className="h-3 w-3 animate-spin" /> Processing
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3 w-3" /> Done
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
          <XCircle className="h-3 w-3" /> Failed
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
          <AlertCircle className="h-3 w-3" /> Cancelled
        </span>
      );
    default:
      return <span className="text-xs text-gray-500">{status}</span>;
  }
}

export function UploadHistoryTable({
  uploads,
  onRetry,
  onCancel,
  isRetrying,
  isCancelling,
}: UploadHistoryTableProps) {
  if (uploads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-6 py-16">
        <Upload className="mb-3 h-10 w-10 text-gray-300" />
        <p className="mb-1 text-lg font-medium text-gray-900">No uploads yet</p>
        <p className="text-sm text-gray-500">Use the form above to upload a downloaded video</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Platform
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Privacy
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Date
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {uploads.map((ul) => (
            <tr key={ul.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[240px]">
                  {ul.title}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded px-1.5 py-0.5 text-xs font-bold text-white ${
                    ul.platform === 'YOUTUBE' ? 'bg-red-600' : 'bg-black'
                  }`}
                >
                  {ul.platform === 'YOUTUBE' ? 'YT' : 'TT'}
                </span>
              </td>
              <td className="px-4 py-3">
                <UploadStatusBadge status={ul.status} progress={ul.progress} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 capitalize">{ul.privacyStatus}</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(ul.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {ul.publishUrl && (
                    <a
                      href={ul.publishUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                      title="View on platform"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {(ul.status === 'FAILED' || ul.status === 'CANCELLED') && (
                    <button
                      onClick={() => onRetry(ul.id)}
                      disabled={isRetrying}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-green-600 disabled:opacity-50"
                      title="Retry upload"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  {(ul.status === 'PENDING' || ul.status === 'UPLOADING') && (
                    <button
                      onClick={() => onCancel(ul.id)}
                      disabled={isCancelling}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
                      title="Cancel upload"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
