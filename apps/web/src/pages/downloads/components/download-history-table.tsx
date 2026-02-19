import { Icon } from '@vibe/core';
import { Download, Rotate, Delete, ExternalPage, Upload } from '@vibe/icons';
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
      <div
        className="flex flex-col items-center justify-center rounded-lg border px-6 py-16"
        style={{
          backgroundColor: 'var(--primary-background-color)',
          borderColor: 'var(--ui-border-color)',
        }}
      >
        <Icon
          icon={Download}
          iconSize={40}
          className="mb-3"
          style={{ color: 'var(--disabled-text-color)' }}
        />
        <p
          className="mb-1"
          style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}
        >
          No downloads yet
        </p>
        <p style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}>
          Go to Trending and click the download button on a video
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--ui-border-color)',
      }}
    >
      <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead style={{ backgroundColor: 'var(--allgrey-background-color)' }}>
          <tr>
            {['Video', 'Platform', 'Status', 'Size', 'Date', ''].map((header, i) => (
              <th
                key={header || 'actions'}
                className={`px-4 py-3 uppercase ${i === 5 ? 'text-right' : 'text-left'}`}
                style={{
                  font: 'var(--font-text3-medium)',
                  color: 'var(--secondary-text-color)',
                  borderBottom: '1px solid var(--ui-border-color)',
                }}
              >
                {header || 'Actions'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
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

  const tdStyle = { borderBottom: '1px solid var(--ui-border-color)' };

  return (
    <tr
      style={{ transition: 'background-color 0.1s' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
          'var(--primary-background-hover-color)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
      }}
    >
      {/* Video info */}
      <td className="px-4 py-3" style={tdStyle}>
        <div className="flex items-center gap-3">
          {download.thumbnailUrl && (
            <img src={download.thumbnailUrl} alt="" className="h-10 w-16 rounded object-cover" />
          )}
          <span
            className="line-clamp-1 max-w-[240px]"
            style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}
          >
            {download.title}
          </span>
        </div>
      </td>

      {/* Platform */}
      <td className="px-4 py-3" style={tdStyle}>
        <span
          className="inline-flex rounded px-1.5 py-0.5"
          style={{
            font: 'var(--font-text3-bold)',
            color: '#ffffff',
            backgroundColor:
              download.platform === 'YOUTUBE'
                ? '#dc2626'
                : download.platform === 'INSTAGRAM'
                  ? '#db2777'
                  : '#000000',
          }}
        >
          {download.platform === 'YOUTUBE' ? 'YT' : download.platform === 'INSTAGRAM' ? 'IG' : 'TT'}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3" style={tdStyle}>
        <DownloadStatusBadge status={download.status} progress={download.progress} />
      </td>

      {/* Size */}
      <td
        className="px-4 py-3"
        style={{
          ...tdStyle,
          font: 'var(--font-text2-normal)',
          color: 'var(--secondary-text-color)',
        }}
      >
        {download.fileSize ? formatFileSize(download.fileSize) : '\u2014'}
      </td>

      {/* Date */}
      <td
        className="px-4 py-3"
        style={{
          ...tdStyle,
          font: 'var(--font-text2-normal)',
          color: 'var(--secondary-text-color)',
        }}
      >
        {formatDate(download.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3" style={tdStyle}>
        <div className="flex items-center justify-end gap-1">
          {download.status === 'COMPLETED' && (
            <>
              <ActionButton
                onClick={() => navigate('/uploads')}
                title="Upload to platform"
                hoverColor="var(--color-purple)"
              >
                <Icon icon={Upload} iconSize={16} />
              </ActionButton>
              <ActionButton
                onClick={handleGetUrl}
                title="Download file"
                hoverColor="var(--primary-color)"
              >
                <Icon icon={ExternalPage} iconSize={16} />
              </ActionButton>
            </>
          )}
          {(download.status === 'FAILED' || download.status === 'CANCELLED') && (
            <ActionButton
              onClick={() => onRetry(download.id)}
              disabled={isRetrying}
              title="Retry download"
              hoverColor="var(--positive-color)"
            >
              <Icon icon={Rotate} iconSize={16} />
            </ActionButton>
          )}
          <ActionButton
            onClick={() => onDelete(download.id)}
            disabled={isDeleting}
            title="Delete download"
            hoverColor="var(--negative-color)"
          >
            <Icon icon={Delete} iconSize={16} />
          </ActionButton>
        </div>
      </td>
    </tr>
  );
}

function ActionButton({
  onClick,
  disabled,
  title,
  hoverColor,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  hoverColor: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded p-1.5 transition-colors disabled:opacity-50"
      style={{ color: 'var(--icon-color)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          'var(--primary-background-hover-color)';
        (e.currentTarget as HTMLButtonElement).style.color = hoverColor;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--icon-color)';
      }}
      title={title}
    >
      {children}
    </button>
  );
}
