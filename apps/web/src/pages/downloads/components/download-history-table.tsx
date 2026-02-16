import { Download, RotateCcw, Trash2, ExternalLink, Upload } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { DownloadedVideo } from '@trendvault/shared-types';
import { apiClient } from '@/lib/api-client';
import { DownloadStatusBadge, formatFileSize, formatDate } from './download-status-badge';

interface DownloadHistoryTableProps {
  downloads: DownloadedVideo[];
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  isRetrying: boolean;
  isDeleting: boolean;
}

export function DownloadHistoryTable({
  downloads,
  onRetry,
  onDelete,
  isRetrying,
  isDeleting,
}: DownloadHistoryTableProps) {
  if (downloads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-6 py-16">
        <Download className="mb-3 h-10 w-10 text-gray-300" />
        <p className="mb-1 text-lg font-medium text-gray-900">No downloads yet</p>
        <p className="text-sm text-gray-500">
          Go to Trending and click the download button on a video
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Video
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Platform
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Size
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
          {downloads.map((dl) => (
            <DownloadRow
              key={dl.id}
              download={dl}
              onRetry={onRetry}
              onDelete={onDelete}
              isRetrying={isRetrying}
              isDeleting={isDeleting}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DownloadRow({
  download,
  onRetry,
  onDelete,
  isRetrying,
  isDeleting,
}: {
  download: DownloadedVideo;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  isRetrying: boolean;
  isDeleting: boolean;
}) {
  const navigate = useNavigate();
  const handleGetUrl = async () => {
    try {
      const response = await apiClient.get<{ success: true; data: { url: string } }>(
        `/downloads/${download.id}/url`,
      );
      window.open(response.data.url, '_blank');
    } catch {
      // URL not available
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      {/* Video info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {download.thumbnailUrl && (
            <img src={download.thumbnailUrl} alt="" className="h-10 w-16 rounded object-cover" />
          )}
          <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[240px]">
            {download.title}
          </span>
        </div>
      </td>

      {/* Platform */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded px-1.5 py-0.5 text-xs font-bold text-white ${
            download.platform === 'YOUTUBE' ? 'bg-red-600' : 'bg-black'
          }`}
        >
          {download.platform === 'YOUTUBE' ? 'YT' : 'TT'}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <DownloadStatusBadge status={download.status} progress={download.progress} />
      </td>

      {/* Size */}
      <td className="px-4 py-3 text-sm text-gray-500">
        {download.fileSize ? formatFileSize(download.fileSize) : '—'}
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(download.createdAt)}</td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {download.status === 'COMPLETED' && (
            <>
              <button
                onClick={() => navigate('/uploads')}
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-purple-600"
                title="Upload to platform"
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                onClick={handleGetUrl}
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                title="Download file"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </>
          )}
          {(download.status === 'FAILED' || download.status === 'CANCELLED') && (
            <button
              onClick={() => onRetry(download.id)}
              disabled={isRetrying}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-green-600 disabled:opacity-50"
              title="Retry download"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(download.id)}
            disabled={isDeleting}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
            title="Delete download"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
