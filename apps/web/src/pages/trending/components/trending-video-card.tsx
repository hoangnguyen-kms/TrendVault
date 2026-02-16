import { ExternalLink, Clock, Eye, ThumbsUp, MessageCircle, Download, Loader2 } from 'lucide-react';
import type { TrendingVideo } from '@trendvault/shared-types';
import { useQueueDownload } from '@/pages/downloads/hooks/use-downloads';

interface TrendingVideoCardProps {
  video: TrendingVideo;
}

export function TrendingVideoCard({ video }: TrendingVideoCardProps) {
  const queueDownload = useQueueDownload();

  const externalUrl =
    video.platform === 'YOUTUBE'
      ? `https://www.youtube.com/watch?v=${video.platformVideoId}`
      : `https://www.tiktok.com/@${video.channelId ?? 'user'}/video/${video.platformVideoId}`;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (video.id) {
      queueDownload.mutate(video.id);
    }
  };

  const handleCardClick = () => {
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="link"
      onClick={handleCardClick}
      className="group block cursor-pointer rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">No thumbnail</div>
        )}

        {/* Duration badge */}
        {video.duration != null && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Platform badge */}
        <span
          className={`absolute top-2 left-2 rounded px-1.5 py-0.5 text-xs font-bold text-white ${
            video.platform === 'YOUTUBE' ? 'bg-red-600' : 'bg-black'
          }`}
        >
          {video.platform === 'YOUTUBE' ? 'YT' : 'TT'}
        </span>

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 group-hover:bg-black/20 transition-colors">
          <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          <button
            onClick={handleDownload}
            disabled={queueDownload.isPending}
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
            title="Download video"
          >
            {queueDownload.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{video.title}</h3>
        {video.channelName && (
          <p className="text-xs text-gray-500 mb-2 truncate">{video.channelName}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {video.viewCount != null && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatCount(video.viewCount)}
            </span>
          )}
          {video.likeCount != null && (
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {formatCount(video.likeCount)}
            </span>
          )}
          {video.commentCount != null && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {formatCount(video.commentCount)}
            </span>
          )}
          {video.publishedAt && (
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(video.publishedAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
