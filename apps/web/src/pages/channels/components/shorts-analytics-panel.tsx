import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess } from '@trendvault/shared-types';

interface ShortsBreakdown {
  shorts: { count: number; avgViews: number | null; avgLikes: number | null };
  regular: { count: number; avgViews: number | null; avgLikes: number | null };
}

interface ShortsAnalyticsPanelProps {
  channelId: string;
}

export function ShortsAnalyticsPanel({ channelId }: ShortsAnalyticsPanelProps) {
  const { data } = useQuery<ApiSuccess<ShortsBreakdown>>({
    queryKey: ['analytics', 'shorts-breakdown', channelId],
    queryFn: () =>
      apiClient.get<ApiSuccess<ShortsBreakdown>>(
        `/analytics/channels/${channelId}/shorts-breakdown`,
      ),
  });

  const bd = data?.data;

  return (
    <div>
      <h3
        className="mb-3 uppercase"
        style={{ font: 'var(--font-text2-medium)', color: 'var(--secondary-text-color)' }}
      >
        Shorts vs Regular
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {(['shorts', 'regular'] as const).map((type) => (
          <div
            key={type}
            className="rounded-lg p-4"
            style={{ border: '1px solid var(--ui-border-color)' }}
          >
            <h4
              className="mb-2 capitalize"
              style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}
            >
              {type}
            </h4>
            <p style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
              {bd?.[type].count ?? 0}
            </p>
            <p style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}>
              videos
            </p>
            {bd?.[type].avgViews != null && (
              <p
                className="mt-1"
                style={{ font: 'var(--font-text2-normal)', color: 'var(--primary-text-color)' }}
              >
                {Math.round(bd[type].avgViews!).toLocaleString()} avg views
              </p>
            )}
            {bd?.[type].avgLikes != null && (
              <p
                className="mt-0.5"
                style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}
              >
                {Math.round(bd[type].avgLikes!).toLocaleString()} avg likes
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
