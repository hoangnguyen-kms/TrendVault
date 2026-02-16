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
        <CardTitle className="text-base">Source vs Published</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Source Platform</span>
            <Badge variant="outline">{trending.platform}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Published Platform</span>
            <Badge variant="outline">{published.platform}</Badge>
          </div>
          <hr />
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Source Views</span>
            <span className="font-medium">{formatCompactNumber(trending.viewCount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Published Views</span>
            <span className="font-medium">{formatCompactNumber(published.viewCount)}</span>
          </div>
          {viewDelta !== null && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">View Delta</span>
              <span
                className={
                  viewDelta >= 0 ? 'font-medium text-green-600' : 'font-medium text-red-500'
                }
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
