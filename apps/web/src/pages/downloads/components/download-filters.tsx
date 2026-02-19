interface DownloadFiltersProps {
  platform: string;
  status: string;
  onPlatformChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}

const PLATFORM_OPTIONS = [
  { value: 'ALL', label: 'All Platforms' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TIKTOK', label: 'TikTok' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DOWNLOADING', label: 'Downloading' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const selectStyle: React.CSSProperties = {
  font: 'var(--font-text2-normal)',
  color: 'var(--primary-text-color)',
  backgroundColor: 'var(--primary-background-color)',
  border: '1px solid var(--ui-border-color)',
  borderRadius: 'var(--border-radius-small)',
  padding: '0.5rem 0.75rem',
  boxShadow: 'var(--box-shadow-xs)',
  outline: 'none',
};

export function DownloadFilters({
  platform,
  status,
  onPlatformChange,
  onStatusChange,
}: DownloadFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={platform}
        onChange={(e) => onPlatformChange(e.target.value)}
        style={selectStyle}
      >
        {PLATFORM_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select value={status} onChange={(e) => onStatusChange(e.target.value)} style={selectStyle}>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
