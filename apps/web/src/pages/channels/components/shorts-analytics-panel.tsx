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
      <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase">Shorts vs Regular</h3>
      <div className="grid grid-cols-2 gap-4">
        {(['shorts', 'regular'] as const).map((type) => (
          <div key={type} className="rounded-lg border p-4">
            <h4 className="text-sm font-semibold capitalize mb-2">{type}</h4>
            <p className="text-2xl font-bold">{bd?.[type].count ?? 0}</p>
            <p className="text-xs text-muted-foreground">videos</p>
            {bd?.[type].avgViews != null && (
              <p className="text-sm mt-1">
                {Math.round(bd[type].avgViews!).toLocaleString()} avg views
              </p>
            )}
            {bd?.[type].avgLikes != null && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {Math.round(bd[type].avgLikes!).toLocaleString()} avg likes
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
