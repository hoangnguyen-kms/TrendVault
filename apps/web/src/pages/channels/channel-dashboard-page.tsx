import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ChannelSidebar } from './components/channel-sidebar';
import { ChannelOverview } from './components/channel-overview';
import { VideoLibraryGrid } from './components/video-library-grid';
import { useChannels } from './hooks/use-channels';

export default function ChannelDashboardPage() {
  const { data: channels, isLoading } = useChannels();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const channelList = (channels ?? []) as Array<{
    id: string;
    platform: string;
    name: string;
    avatarUrl: string | null;
    subscriberCount: number | null;
  }>;

  // Auto-select first channel
  const activeId = selectedId ?? channelList[0]?.id;

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-64 border-r p-4">
          <Skeleton className="mb-4 h-6 w-24" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="mb-2 h-12" />
          ))}
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (channelList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-700">No Channels Connected</h2>
          <p className="mt-1 text-sm text-gray-500">
            Connect a YouTube or TikTok account in{' '}
            <a href="/settings" className="text-blue-600 underline">Settings</a>{' '}
            to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <ChannelSidebar
        channels={channelList}
        selectedId={activeId}
        onSelect={setSelectedId}
      />
      <div className="flex-1 overflow-y-auto">
        {activeId && (
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b px-6 pt-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="library">Video Library</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview">
              <ChannelOverview channelId={activeId} />
            </TabsContent>
            <TabsContent value="library">
              <VideoLibraryGrid channelId={activeId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
