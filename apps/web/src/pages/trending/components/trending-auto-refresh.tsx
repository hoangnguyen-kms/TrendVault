import { Icon } from '@vibe/core';
import { Retry } from '@vibe/icons';
import { useTrendingFilters } from '../hooks/use-trending-filters';
import { cn } from '@/lib/utils';

const INTERVALS = [
  { value: 60_000, label: '1 min' },
  { value: 300_000, label: '5 min' },
  { value: 900_000, label: '15 min' },
  { value: 1_800_000, label: '30 min' },
];

export function TrendingAutoRefresh() {
  const { autoRefresh, refreshInterval, toggleAutoRefresh, setRefreshInterval } =
    useTrendingFilters();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleAutoRefresh}
        className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors')}
        style={{
          font: 'var(--font-text2-medium)',
          ...(autoRefresh
            ? {
                backgroundColor: 'var(--primary-selected-color)',
                color: 'var(--primary-color)',
              }
            : {
                backgroundColor: 'var(--allgrey-background-color)',
                color: 'var(--secondary-text-color)',
              }),
        }}
      >
        <Icon icon={Retry} iconSize={14} className={cn(autoRefresh && 'animate-spin')} />
        Auto
      </button>

      {autoRefresh && (
        <select
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          className="rounded-md border px-2 py-1.5 outline-none transition-colors"
          style={{
            font: 'var(--font-text2-normal)',
            borderColor: 'var(--ui-border-color)',
            backgroundColor: 'var(--primary-background-color)',
            color: 'var(--secondary-text-color)',
          }}
        >
          {INTERVALS.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
