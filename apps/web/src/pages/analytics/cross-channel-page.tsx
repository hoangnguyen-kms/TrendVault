import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AggregateStatsCards } from './components/aggregate-stats-cards';
import { PlatformComparisonChart } from './components/platform-comparison-chart';
import { ContentComparisonTable } from './components/content-comparison-table';
import { useCrossChannelAggregate, useCrossChannelComparison } from './hooks/use-analytics';

export default function CrossChannelPage() {
  const { data: aggregate, isLoading: aggLoading } = useCrossChannelAggregate();
  const { data: comparison, isLoading: compLoading } = useCrossChannelComparison();

  if (aggLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  const agg = aggregate as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold">Cross-Channel Analytics</h1>

      <AggregateStatsCards data={agg as { totalChannels: number; totalVideos: number; totalViews: number; totalLikes: number } | undefined} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformComparisonChart data={agg as { platformBreakdown?: Array<{ platform: string; views: number; likes: number; videos: number }> } | undefined} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            {agg ? (
              <div className="space-y-2">
                <p>Total channels: <strong>{agg.totalChannels as number}</strong></p>
                <p>Total published videos: <strong>{agg.totalVideos as number}</strong></p>
                <p>Total views: <strong>{(agg.totalViews as number)?.toLocaleString()}</strong></p>
              </div>
            ) : (
              <p>No data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentComparisonTable data={comparison as Array<{ sourceTitle: string; sourcePlatform: string; publishedVersions: Array<{ publishedVideoId: string; channelName: string; platform: string; viewCount: number; likeCount: number; commentCount: number }> }> | undefined} isLoading={compLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
