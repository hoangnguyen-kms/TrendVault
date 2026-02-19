import { Icon, Loader } from '@vibe/core';
import { ExternalPage, Time, Show, ThumbsUp, Comment, Download } from '@vibe/icons';
import type { TrendingVideo } from '@trendvault/shared-types';
import { useQueueDownload } from '@/pages/downloads/hooks/use-downloads';
import { cn } from '@/lib/utils';
import { ShortsBadge } from './shorts-badge';

interface TrendingVideoCardProps {
  video: TrendingVideo;
}

export function TrendingVideoCard({ video }: TrendingVideoCardProps) {
  const queueDownload = useQueueDownload();

  const externalUrl =
    video.platform === 'YOUTUBE'
      ? `https://www.youtube.com/watch?v=${video.platformVideoId}`
      : video.platform === 'INSTAGRAM'
        ? `https://www.instagram.com/reel/${video.platformVideoId}`
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
      className="group block cursor-pointer rounded-lg border overflow-hidden transition-shadow"
      style={{
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--ui-border-color)',
        boxShadow: 'var(--box-shadow-xs)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--box-shadow-small)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--box-shadow-xs)';
      }}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          'relative overflow-hidden rounded-t-lg',
          video.isShort ? 'aspect-[9/16] max-w-[200px]' : 'aspect-video',
        )}
        style={{ backgroundColor: 'var(--allgrey-background-color)' }}
      >
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{ color: 'var(--disabled-text-color)' }}
          >
            No thumbnail
          </div>
        )}

        {/* Duration badge */}
        {video.duration != null && (
          <span
            className="absolute bottom-2 right-2 rounded px-1.5 py-0.5"
            style={{
              font: 'var(--font-text3-medium)',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: '#ffffff',
            }}
          >
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Platform badge — branded colors kept intentionally */}
        <span
          className="absolute top-2 left-2 rounded px-1.5 py-0.5"
          style={{
            font: 'var(--font-text3-bold)',
            color: '#ffffff',
            backgroundColor:
              video.platform === 'YOUTUBE'
                ? '#dc2626'
                : video.platform === 'INSTAGRAM'
                  ? '#db2777'
                  : '#000000',
          }}
        >
          {video.platform === 'YOUTUBE' ? 'YT' : video.platform === 'INSTAGRAM' ? 'IG' : 'TT'}
        </span>

        {/* Shorts badge */}
        {video.isShort && <ShortsBadge className="absolute top-2 right-2" />}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 group-hover:bg-black/20 transition-colors">
          <Icon
            icon={ExternalPage}
            iconSize={24}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: '#ffffff' }}
          />
          <button
            onClick={handleDownload}
            disabled={queueDownload.isPending}
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-2 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'var(--text-color-on-primary)',
            }}
            title="Download video"
          >
            {queueDownload.isPending ? (
              <Loader size={Loader.sizes?.XS} />
            ) : (
              <Icon icon={Download} iconSize={16} />
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3
          className="line-clamp-2 mb-1"
          style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}
        >
          {video.title}
        </h3>
        {video.channelName && (
          <p
            className="mb-2 truncate"
            style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}
          >
            {video.channelName}
          </p>
        )}

        {/* Stats row */}
        <div
          className="flex items-center gap-3"
          style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}
        >
          {video.viewCount != null && (
            <span className="flex items-center gap-1">
              <Icon icon={Show} iconSize={12} />
              {formatCount(video.viewCount)}
            </span>
          )}
          {video.likeCount != null && (
            <span className="flex items-center gap-1">
              <Icon icon={ThumbsUp} iconSize={12} />
              {formatCount(video.likeCount)}
            </span>
          )}
          {video.commentCount != null && (
            <span className="flex items-center gap-1">
              <Icon icon={Comment} iconSize={12} />
              {formatCount(video.commentCount)}
            </span>
          )}
          {video.publishedAt && (
            <span className="flex items-center gap-1 ml-auto">
              <Icon icon={Time} iconSize={12} />
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
