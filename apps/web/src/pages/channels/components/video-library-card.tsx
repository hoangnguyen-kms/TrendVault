import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, ThumbsUp } from 'lucide-react';
import { formatCompactNumber, formatDate } from '@/lib/format-utils';

interface VideoLibraryCardProps {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  viewCount: number;
  likeCount: number;
  publishedAt: string | null;
}

export function VideoLibraryCard({
  id,
  title,
  thumbnailUrl,
  viewCount,
  likeCount,
  publishedAt,
}: VideoLibraryCardProps) {
  return (
    <Link to={`/videos/${id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-video bg-gray-100">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No thumbnail
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h4 className="line-clamp-2 text-sm font-medium leading-tight">{title}</h4>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatCompactNumber(viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {formatCompactNumber(likeCount)}
            </span>
            <span className="ml-auto">{formatDate(publishedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
