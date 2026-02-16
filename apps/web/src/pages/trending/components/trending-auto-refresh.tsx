import { RefreshCw } from 'lucide-react';
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
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          autoRefresh ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        )}
      >
        <RefreshCw className={cn('h-3.5 w-3.5', autoRefresh && 'animate-spin')} />
        Auto
      </button>

      {autoRefresh && (
        <select
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
