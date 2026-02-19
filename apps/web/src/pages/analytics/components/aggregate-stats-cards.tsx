import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@vibe/core';
import { Team, Video, Show, ThumbsUp } from '@vibe/icons';
import { formatCompactNumber } from '@/lib/format-utils';

interface AggregateStatsCardsProps {
  data:
    | {
        totalChannels: number;
        totalVideos: number;
        totalViews: number;
        totalLikes: number;
        platforms?: string[];
      }
    | undefined;
}

const cards = [
  {
    key: 'totalChannels',
    label: 'Channels',
    icon: Team,
    iconColor: 'var(--primary-color)',
    bgColor: 'var(--primary-selected-color)',
  },
  {
    key: 'totalVideos',
    label: 'Videos',
    icon: Video,
    iconColor: 'var(--color-purple)',
    bgColor: 'var(--color-purple-selected)',
  },
  {
    key: 'totalViews',
    label: 'Total Views',
    icon: Show,
    iconColor: 'var(--positive-color)',
    bgColor: 'var(--positive-color-selected)',
  },
  {
    key: 'totalLikes',
    label: 'Total Likes',
    icon: ThumbsUp,
    iconColor: 'var(--negative-color)',
    bgColor: 'var(--negative-color-selected)',
  },
] as const;

export function AggregateStatsCards({ data }: AggregateStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const value = data ? data[card.key] : 0;
        return (
          <Card key={card.key}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg p-3" style={{ backgroundColor: card.bgColor }}>
                <Icon icon={card.icon} iconSize={20} style={{ color: card.iconColor }} />
              </div>
              <div>
                <p
                  style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
                >
                  {card.label}
                </p>
                <p style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
                  {formatCompactNumber(value)}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
