import { Icon, Loader } from '@vibe/core';
import { Check, CloseRound, Time, Alert } from '@vibe/icons';

export function DownloadStatusBadge({ status, progress }: { status: string; progress: number }) {
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
    case 'DOWNLOADING':
      return (
        <span
          className="inline-flex items-center gap-1"
          style={{ ...base, color: 'var(--primary-color)' }}
        >
          <Loader size={Loader.sizes?.XS} /> {progress}%
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

export function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
