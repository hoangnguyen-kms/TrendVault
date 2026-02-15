import { Card, CardContent } from '@/components/ui/card';
import { Users, Video, Eye, ThumbsUp } from 'lucide-react';
import { formatCompactNumber } from '@/lib/format-utils';

interface AggregateStatsCardsProps {
  data: {
    totalChannels: number;
    totalVideos: number;
    totalViews: number;
    totalLikes: number;
    platforms?: string[];
  } | undefined;
}

const cards = [
  { key: 'totalChannels', label: 'Channels', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { key: 'totalVideos', label: 'Videos', icon: Video, color: 'text-purple-600 bg-purple-50' },
  { key: 'totalViews', label: 'Total Views', icon: Eye, color: 'text-green-600 bg-green-50' },
  { key: 'totalLikes', label: 'Total Likes', icon: ThumbsUp, color: 'text-red-600 bg-red-50' },
] as const;

export function AggregateStatsCards({ data }: AggregateStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = data ? (data as Record<string, number>)[card.key] : 0;
        return (
          <Card key={card.key}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`rounded-lg p-3 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold">{formatCompactNumber(value)}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
