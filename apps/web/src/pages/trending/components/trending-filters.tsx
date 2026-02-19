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

  const selectStyle = {
    font: 'var(--font-text2-normal)',
    borderColor: 'var(--ui-border-color)',
    backgroundColor: 'var(--primary-background-color)',
    color: 'var(--secondary-text-color)',
  };

  return (
    <div className="space-y-3">
      {/* Platform tabs */}
      <div
        className="flex gap-1 rounded-lg p-1"
        style={{ backgroundColor: 'var(--allgrey-background-color)' }}
      >
        {PLATFORM_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPlatform(tab.value)}
            className={cn('flex-1 rounded-md px-3 py-1.5 transition-colors')}
            style={{
              font: 'var(--font-text2-medium)',
              ...(platform === tab.value
                ? {
                    backgroundColor: 'var(--primary-background-color)',
                    color: 'var(--primary-text-color)',
                    boxShadow: 'var(--box-shadow-xs)',
                  }
                : {
                    color: 'var(--secondary-text-color)',
                  }),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content type filter */}
      <div
        className="flex gap-1 rounded-lg p-1"
        style={{ backgroundColor: 'var(--allgrey-background-color)' }}
      >
        {(['all', 'shorts', 'regular'] as const).map((ct) => (
          <button
            key={ct}
            onClick={() => setContentType(ct)}
            className={cn('rounded-md px-3 py-1.5 transition-colors')}
            style={{
              font: 'var(--font-text2-medium)',
              ...(contentType === ct
                ? {
                    backgroundColor: 'var(--primary-background-color)',
                    color: 'var(--primary-text-color)',
                    boxShadow: 'var(--box-shadow-xs)',
                  }
                : {
                    color: 'var(--secondary-text-color)',
                  }),
            }}
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
          className="rounded-md border px-3 py-1.5 outline-none"
          style={selectStyle}
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
            className="rounded-md border px-3 py-1.5 outline-none"
            style={selectStyle}
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
