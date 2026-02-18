import { useTrendingFilters } from '../hooks/use-trending-filters';
import { useSupportedRegions } from '../hooks/use-trending-videos';
import { cn } from '@/lib/utils';

const PLATFORM_TABS = [
  { value: 'ALL' as const, label: 'All' },
  { value: 'YOUTUBE' as const, label: 'YouTube' },
  { value: 'TIKTOK' as const, label: 'TikTok' },
  { value: 'INSTAGRAM' as const, label: 'Instagram' },
];

export function TrendingFilters() {
  const {
    platform,
    region,
    category,
    contentType,
    setPlatform,
    setRegion,
    setCategory,
    setContentType,
  } = useTrendingFilters();
  const { data: regionsData } = useSupportedRegions();

  return (
    <div className="space-y-3">
      {/* Platform tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {PLATFORM_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPlatform(tab.value)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              platform === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content type filter */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {(['all', 'shorts', 'regular'] as const).map((ct) => (
          <button
            key={ct}
            onClick={() => setContentType(ct)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              contentType === ct
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            )}
          >
            {ct === 'all' ? 'All' : ct === 'shorts' ? 'Shorts' : 'Regular'}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        {/* Region select */}
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {(regionsData?.regions ?? []).map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </select>

        {/* YouTube category select (only when YouTube selected) */}
        {platform === 'YOUTUBE' && (
          <select
            value={category ?? ''}
            onChange={(e) => setCategory(e.target.value || null)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {(regionsData?.categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
