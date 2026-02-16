import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, Video, TrendingUp } from 'lucide-react';
import { formatCompactNumber } from '@/lib/format-utils';

interface ChannelStatsCardsProps {
  subscriberCount: number | null;
  totalViews: number | null;
  totalVideos: number | null;
  avgEngagementRate: number | null;
}

const stats = [
  { key: 'subscribers', label: 'Subscribers', icon: Users, color: 'text-blue-600' },
  { key: 'views', label: 'Total Views', icon: Eye, color: 'text-green-600' },
  { key: 'videos', label: 'Total Videos', icon: Video, color: 'text-purple-600' },
  { key: 'engagement', label: 'Engagement', icon: TrendingUp, color: 'text-orange-600' },
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
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.label}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{values[stat.key]}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
