import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Icon } from '@vibe/core';
import { MoveArrowLeftNarrow, ExternalPage } from '@vibe/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VideoPlayer } from './components/video-player';
import { StatsTimeSeriesChart } from './components/stats-time-series-chart';
import { ContentLifecycleView } from './components/content-lifecycle-view';
import { PerformanceComparison } from './components/performance-comparison';
import { useVideoDetail, useVideoStats, useContentLifecycle } from './hooks/use-video-stats';
import { formatCompactNumber, formatDate, formatDuration } from '@/lib/format-utils';

export default function VideoDetailPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const [dateRange, setDateRange] = useState('30d');
  const [metric, setMetric] = useState<'views' | 'likes' | 'comments' | 'all'>('all');

  const { data: video, isLoading: videoLoading } = useVideoDetail(videoId!);
  const { data: stats } = useVideoStats(videoId!, dateRange);
  const { data: lifecycle } = useContentLifecycle(videoId!);

  if (videoLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-video w-full max-w-2xl rounded-lg" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: 'var(--secondary-text-color)' }}>Video not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link to={video.channelId ? `/channels` : '/'}>
          <Button variant="ghost" size="sm">
            <Icon icon={MoveArrowLeftNarrow} iconSize={16} className="mr-1" />
            Back
          </Button>
        </Link>
        <h1
          className="flex-1 truncate"
          style={{ font: 'var(--font-h3-bold)', color: 'var(--primary-text-color)' }}
        >
          {video.title}
        </h1>
        <Badge variant="outline">{video.platform}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer src={video.thumbnailUrl} title={video.title} />

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Views', value: video.viewCount },
                  { label: 'Likes', value: video.likeCount },
                  { label: 'Comments', value: video.commentCount },
                  { label: 'Shares', value: video.shareCount },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p
                      style={{
                        font: 'var(--font-text3-normal)',
                        color: 'var(--secondary-text-color)',
                      }}
                    >
                      {stat.label}
                    </p>
                    <p
                      style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}
                    >
                      {formatCompactNumber(stat.value)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  <span style={{ font: 'var(--font-text1-medium)' }}>Performance Over Time</span>
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Metrics</SelectItem>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="likes">Likes</SelectItem>
                      <SelectItem value="comments">Comments</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StatsTimeSeriesChart data={stats} metric={metric} dateRange={dateRange} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <span style={{ font: 'var(--font-text1-medium)' }}>Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {video.channel?.name && (
                <div>
                  <p
                    style={{
                      font: 'var(--font-text3-normal)',
                      color: 'var(--secondary-text-color)',
                    }}
                  >
                    Channel
                  </p>
                  <p
                    style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}
                  >
                    {video.channel.name}
                  </p>
                </div>
              )}
              {video.publishedAt && (
                <div>
                  <p
                    style={{
                      font: 'var(--font-text3-normal)',
                      color: 'var(--secondary-text-color)',
                    }}
                  >
                    Published
                  </p>
                  <p
                    style={{ font: 'var(--font-text2-normal)', color: 'var(--primary-text-color)' }}
                  >
                    {formatDate(video.publishedAt)}
                  </p>
                </div>
              )}
              {video.duration != null && (
                <div>
                  <p
                    style={{
                      font: 'var(--font-text3-normal)',
                      color: 'var(--secondary-text-color)',
                    }}
                  >
                    Duration
                  </p>
                  <p
                    style={{ font: 'var(--font-text2-normal)', color: 'var(--primary-text-color)' }}
                  >
                    {formatDuration(video.duration)}
                  </p>
                </div>
              )}
              {video.privacyStatus && (
                <div>
                  <p
                    style={{
                      font: 'var(--font-text3-normal)',
                      color: 'var(--secondary-text-color)',
                    }}
                  >
                    Privacy
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {video.privacyStatus}
                  </Badge>
                </div>
              )}
              {video.tags && video.tags.length > 0 && (
                <div>
                  <p
                    className="mb-1"
                    style={{
                      font: 'var(--font-text3-normal)',
                      color: 'var(--secondary-text-color)',
                    }}
                  >
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {video.tags.slice(0, 8).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {video.tags.length > 8 && (
                      <span
                        style={{
                          font: 'var(--font-text3-normal)',
                          color: 'var(--disabled-text-color)',
                        }}
                      >
                        +{video.tags.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {video.description && (
                <div>
                  <p
                    style={{
                      font: 'var(--font-text3-normal)',
                      color: 'var(--secondary-text-color)',
                    }}
                  >
                    Description
                  </p>
                  <p
                    className="line-clamp-6 whitespace-pre-wrap"
                    style={{
                      font: 'var(--font-text2-normal)',
                      color: 'var(--secondary-text-color)',
                    }}
                  >
                    {video.description}
                  </p>
                </div>
              )}
              {video.platformVideoId && (
                <a
                  href={
                    video.platform === 'YOUTUBE'
                      ? `https://youtube.com/watch?v=${video.platformVideoId}`
                      : video.platform === 'INSTAGRAM'
                        ? `https://www.instagram.com/reel/${video.platformVideoId}`
                        : `https://tiktok.com/@_/video/${video.platformVideoId}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    <Icon icon={ExternalPage} iconSize={12} className="mr-1" />
                    View on{' '}
                    {video.platform === 'YOUTUBE'
                      ? 'YouTube'
                      : video.platform === 'INSTAGRAM'
                        ? 'Instagram'
                        : 'TikTok'}
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          <PerformanceComparison videoId={videoId!} />
        </div>
      </div>

      <ContentLifecycleView data={lifecycle} />
    </div>
  );
}
