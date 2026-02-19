import { Icon, Loader } from '@vibe/core';
import { Rotate, Delete, ExternalPage, Check, CloseRound, Time, Alert, Upload } from '@vibe/icons';
import type { UploadJob } from '@trendvault/shared-types';

interface UploadHistoryTableProps {
  uploads: UploadJob[];
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  isRetrying: boolean;
  isCancelling: boolean;
}

function UploadStatusBadge({ status, progress }: { status: string; progress: number }) {
  const base = { font: 'var(--font-text3-medium)' };

  switch (status) {
    case 'PENDING':
      return (
        <span
          className="inline-flex items-center gap-1"
          style={{ ...base, color: 'var(--warning-color)' }}
        >
          <Icon icon={Time} iconSize={12} /> Pending
        </span>
      );
    case 'UPLOADING':
      return (
        <span
          className="inline-flex items-center gap-1"
          style={{ ...base, color: 'var(--primary-color)' }}
        >
          <Loader size={Loader.sizes?.XS} /> {progress}%
        </span>
      );
    case 'PROCESSING':
      return (
        <span
          className="inline-flex items-center gap-1"
          style={{ ...base, color: 'var(--color-purple)' }}
        >
          <Loader size={Loader.sizes?.XS} /> Processing
        </span>
      );
    case 'COMPLETED':
      return (
        <span
          className="inline-flex items-center gap-1"
          style={{ ...base, color: 'var(--positive-color)' }}
        >
          <Icon icon={Check} iconSize={12} /> Done
        </span>
      );
    case 'FAILED':
      return (
        <span
          className="inline-flex items-center gap-1"
          style={{ ...base, color: 'var(--negative-color)' }}
        >
          <Icon icon={CloseRound} iconSize={12} /> Failed
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className="inline-flex items-center gap-1"
          style={{ ...base, color: 'var(--secondary-text-color)' }}
        >
          <Icon icon={Alert} iconSize={12} /> Cancelled
        </span>
      );
    default:
      return (
        <span style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}>
          {status}
        </span>
      );
  }
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

export function UploadHistoryTable({
  uploads,
  onRetry,
  onCancel,
  isRetrying,
  isCancelling,
}: UploadHistoryTableProps) {
  if (uploads.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border px-6 py-16"
        style={{
          backgroundColor: 'var(--primary-background-color)',
          borderColor: 'var(--ui-border-color)',
        }}
      >
        <Icon
          icon={Upload}
          iconSize={40}
          className="mb-3"
          style={{ color: 'var(--disabled-text-color)' }}
        />
        <p
          className="mb-1"
          style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}
        >
          No uploads yet
        </p>
        <p style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}>
          Use the form above to upload a downloaded video
        </p>
      </div>
    );
  }

  const tdStyle = { borderBottom: '1px solid var(--ui-border-color)' };

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
            {['Title', 'Platform', 'Status', 'Privacy', 'Date', ''].map((header, i) => (
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
          {uploads.map((ul) => (
            <tr
              key={ul.id}
              style={{ transition: 'background-color 0.1s' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                  'var(--primary-background-hover-color)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
              }}
            >
              <td className="px-4 py-3" style={tdStyle}>
                <span
                  className="line-clamp-1 max-w-[240px]"
                  style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}
                >
                  {ul.title}
                </span>
              </td>
              <td className="px-4 py-3" style={tdStyle}>
                <span
                  className="inline-flex rounded px-1.5 py-0.5"
                  style={{
                    font: 'var(--font-text3-bold)',
                    color: '#ffffff',
                    backgroundColor:
                      ul.platform === 'YOUTUBE'
                        ? '#dc2626'
                        : ul.platform === 'INSTAGRAM'
                          ? '#db2777'
                          : '#000000',
                  }}
                >
                  {ul.platform === 'YOUTUBE' ? 'YT' : ul.platform === 'INSTAGRAM' ? 'IG' : 'TT'}
                </span>
              </td>
              <td className="px-4 py-3" style={tdStyle}>
                <UploadStatusBadge status={ul.status} progress={ul.progress} />
              </td>
              <td
                className="px-4 py-3 capitalize"
                style={{
                  ...tdStyle,
                  font: 'var(--font-text2-normal)',
                  color: 'var(--secondary-text-color)',
                }}
              >
                {ul.privacyStatus}
              </td>
              <td
                className="px-4 py-3"
                style={{
                  ...tdStyle,
                  font: 'var(--font-text2-normal)',
                  color: 'var(--secondary-text-color)',
                }}
              >
                {new Date(ul.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-4 py-3" style={tdStyle}>
                <div className="flex items-center justify-end gap-1">
                  {ul.publishUrl && (
                    <a
                      href={ul.publishUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1.5 transition-colors"
                      style={{ color: 'var(--icon-color)' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                          'var(--primary-background-hover-color)';
                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary-color)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                          'transparent';
                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--icon-color)';
                      }}
                      title="View on platform"
                    >
                      <Icon icon={ExternalPage} iconSize={16} />
                    </a>
                  )}
                  {(ul.status === 'FAILED' || ul.status === 'CANCELLED') && (
                    <ActionButton
                      onClick={() => onRetry(ul.id)}
                      disabled={isRetrying}
                      title="Retry upload"
                      hoverColor="var(--positive-color)"
                    >
                      <Icon icon={Rotate} iconSize={16} />
                    </ActionButton>
                  )}
                  {(ul.status === 'PENDING' || ul.status === 'UPLOADING') && (
                    <ActionButton
                      onClick={() => onCancel(ul.id)}
                      disabled={isCancelling}
                      title="Cancel upload"
                      hoverColor="var(--negative-color)"
                    >
                      <Icon icon={Delete} iconSize={16} />
                    </ActionButton>
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
