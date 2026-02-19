import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@vibe/core';
import { Show, ThumbsUp } from '@vibe/icons';
import { formatCompactNumber, formatDate } from '@/lib/format-utils';
import { ShortsBadge } from '../../trending/components/shorts-badge';

interface VideoLibraryCardProps {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  viewCount: number;
  likeCount: number;
  publishedAt: string | null;
  isShort?: boolean;
}

export function VideoLibraryCard({
  id,
  title,
  thumbnailUrl,
  viewCount,
  likeCount,
  publishedAt,
  isShort,
}: VideoLibraryCardProps) {
  return (
    <Link to={`/videos/${id}`}>
      <Card
        className="overflow-hidden transition-shadow"
        style={{ boxShadow: 'var(--box-shadow-xs)' }}
      >
        <div
          className="relative aspect-video"
          style={{ backgroundColor: 'var(--allgrey-background-color)' }}
        >
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={{ color: 'var(--disabled-text-color)' }}
            >
              No thumbnail
            </div>
          )}
          {isShort && <ShortsBadge className="absolute top-1 right-1" />}
        </div>
        <CardContent className="p-3">
          <h4
            className="line-clamp-2 leading-tight"
            style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}
          >
            {title}
          </h4>
          <div
            className="mt-2 flex items-center gap-3"
            style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}
          >
            <span className="flex items-center gap-1">
              <Icon icon={Show} iconSize={12} />
              {formatCompactNumber(viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Icon icon={ThumbsUp} iconSize={12} />
              {formatCompactNumber(likeCount)}
            </span>
            <span className="ml-auto">{formatDate(publishedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
