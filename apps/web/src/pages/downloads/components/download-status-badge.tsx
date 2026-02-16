import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export function DownloadStatusBadge({ status, progress }: { status: string; progress: number }) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700">
          <Clock className="h-3 w-3" /> Pending
        </span>
      );
    case 'DOWNLOADING':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
          <Loader2 className="h-3 w-3 animate-spin" /> {progress}%
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
