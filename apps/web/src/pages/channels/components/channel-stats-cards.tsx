import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@vibe/core';
import { Team, Show, Video, Activity } from '@vibe/icons';
import { formatCompactNumber } from '@/lib/format-utils';

interface ChannelStatsCardsProps {
  subscriberCount: number | null;
  totalViews: number | null;
  totalVideos: number | null;
  avgEngagementRate: number | null;
}

const stats = [
  { key: 'subscribers', label: 'Subscribers', icon: Team, color: 'var(--primary-color)' },
  { key: 'views', label: 'Total Views', icon: Show, color: 'var(--positive-color)' },
  { key: 'videos', label: 'Total Videos', icon: Video, color: 'var(--color-purple)' },
  { key: 'engagement', label: 'Engagement', icon: Activity, color: 'var(--color-working_orange)' },
] as const;

export function ChannelStatsCards({
  subscriberCount,
  totalViews,
  totalVideos,
  avgEngagementRate,
}: ChannelStatsCardsProps) {
  const values: Record<string, string> = {
    subscribers: formatCompactNumber(subscriberCount),
    views: formatCompactNumber(totalViews),
    videos: String(totalVideos ?? 0),
    engagement: avgEngagementRate != null ? `${(avgEngagementRate * 100).toFixed(1)}%` : '-',
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              <span
                style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
              >
                {stat.label}
              </span>
            </CardTitle>
            <Icon icon={stat.icon} iconSize={16} style={{ color: stat.color }} />
          </CardHeader>
          <CardContent>
            <div style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
              {values[stat.key]}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
