import { Skeleton } from '@/components/ui/skeleton';
import { ChannelStatsCards } from './channel-stats-cards';
import { EngagementChart } from './engagement-chart';
import { VideoLibraryCard } from './video-library-card';
import { useChannelOverview } from '../hooks/use-channels';

interface ChannelOverviewProps {
  channelId: string;
}

export function ChannelOverview({ channelId }: ChannelOverviewProps) {
  const { data, isLoading } = useChannelOverview(channelId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      <ChannelStatsCards
        subscriberCount={data.subscriberCount}
        totalViews={data.totalViews}
        totalVideos={data.totalVideos}
        avgEngagementRate={data.avgEngagementRate}
      />

      <EngagementChart data={data.recentVideos} />

      {data.recentVideos.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase">Recent Videos</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.recentVideos.map((video: Record<string, unknown>) => (
              <VideoLibraryCard
                key={video.id as string}
                id={video.id as string}
                title={video.title as string}
                thumbnailUrl={video.thumbnailUrl as string | null}
                viewCount={video.viewCount as number}
                likeCount={video.likeCount as number}
                publishedAt={video.publishedAt as string | null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
