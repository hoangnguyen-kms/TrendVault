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

  return (
    <div className="space-y-6 p-6">
      <h1 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
        Cross-Channel Analytics
      </h1>

      <AggregateStatsCards data={aggregate} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <span style={{ font: 'var(--font-text1-medium)' }}>Platform Comparison</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformComparisonChart data={aggregate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span style={{ font: 'var(--font-text1-medium)' }}>Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent
            style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
          >
            {aggregate ? (
              <div className="space-y-2">
                <p>
                  Total channels: <strong>{aggregate.totalChannels}</strong>
                </p>
                <p>
                  Total published videos: <strong>{aggregate.totalVideos}</strong>
                </p>
                <p>
                  Total views: <strong>{aggregate.totalViews?.toLocaleString()}</strong>
                </p>
                <p
                  className="pt-2"
                  style={{
                    font: 'var(--font-text3-normal)',
                    color: 'var(--secondary-text-color)',
                    borderTop: '1px solid var(--ui-border-color)',
                  }}
                >
                  Shorts vs Regular breakdown is available per channel. Open a channel and view the
                  Shorts &amp; Regular panel for detailed split metrics.
                </p>
              </div>
            ) : (
              <p>No data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <span style={{ font: 'var(--font-text1-medium)' }}>Content Performance Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentComparisonTable data={comparison} isLoading={compLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
