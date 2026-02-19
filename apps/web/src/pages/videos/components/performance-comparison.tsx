import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { formatCompactNumber } from '@/lib/format-utils';
import type { ApiSuccess, ContentLifecycle } from '@trendvault/shared-types';

interface PerformanceComparisonProps {
  videoId: string;
}

export function PerformanceComparison({ videoId }: PerformanceComparisonProps) {
  const { data } = useQuery({
    queryKey: ['video-lifecycle', videoId],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<ContentLifecycle>>(
        `/analytics/videos/${videoId}/lifecycle`,
      );
      return res.data;
    },
    enabled: !!videoId,
  });

  if (!data?.trending || !data?.published) return null;

  const trending = data.trending;
  const published = data.published;

  const viewDelta =
    trending.viewCount != null && published.viewCount != null
      ? Number(published.viewCount) - Number(trending.viewCount)
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span style={{ font: 'var(--font-text1-medium)' }}>Source vs Published</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3" style={{ font: 'var(--font-text2-normal)' }}>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--secondary-text-color)' }}>Source Platform</span>
            <Badge variant="outline">{trending.platform}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--secondary-text-color)' }}>Published Platform</span>
            <Badge variant="outline">{published.platform}</Badge>
          </div>
          <hr style={{ borderColor: 'var(--ui-border-color)' }} />
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--secondary-text-color)' }}>Source Views</span>
            <span style={{ font: 'var(--font-text2-medium)' }}>
              {formatCompactNumber(trending.viewCount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--secondary-text-color)' }}>Published Views</span>
            <span style={{ font: 'var(--font-text2-medium)' }}>
              {formatCompactNumber(published.viewCount)}
            </span>
          </div>
          {viewDelta !== null && (
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--secondary-text-color)' }}>View Delta</span>
              <span
                style={{
                  font: 'var(--font-text2-medium)',
                  color: viewDelta >= 0 ? 'var(--positive-color)' : 'var(--negative-color)',
                }}
              >
                {viewDelta >= 0 ? '+' : ''}
                {formatCompactNumber(viewDelta)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
