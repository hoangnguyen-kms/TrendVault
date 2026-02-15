import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoLibraryCard } from './video-library-card';
import { useChannelVideos } from '../hooks/use-channel-videos';

interface VideoLibraryGridProps {
  channelId: string;
}

export function VideoLibraryGrid({ channelId }: VideoLibraryGridProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useChannelVideos(channelId, {
    page, limit: 12, search, sortBy, sortOrder: 'desc',
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search videos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="publishedAt">Date</SelectItem>
            <SelectItem value="viewCount">Views</SelectItem>
            <SelectItem value="likeCount">Likes</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-lg" />
          ))}
        </div>
      ) : data?.data?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((video: Record<string, unknown>) => (
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
          {data.total > data.limit && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {Math.ceil(data.total / data.limit)}
              </span>
              <Button variant="outline" size="sm" disabled={!data.hasMore} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="py-8 text-center text-sm text-gray-400">No videos found.</p>
      )}
    </div>
  );
}
