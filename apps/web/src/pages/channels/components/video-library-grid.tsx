import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@vibe/core';
import { Search, DropdownChevronLeft, DropdownChevronRight } from '@vibe/icons';
import { VideoLibraryCard } from './video-library-card';
import { useChannelVideos } from '../hooks/use-channel-videos';

interface VideoLibraryGridProps {
  channelId: string;
}

type ContentFilter = 'all' | 'shorts' | 'regular';

const CONTENT_FILTER_LABELS: Record<ContentFilter, string> = {
  all: 'All',
  shorts: 'Shorts',
  regular: 'Regular',
};

export function VideoLibraryGrid({ channelId }: VideoLibraryGridProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'publishedAt' | 'viewCount' | 'likeCount' | 'title'>(
    'publishedAt',
  );
  const [searchInput, setSearchInput] = useState('');
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');

  const { data, isLoading } = useChannelVideos(channelId, {
    page,
    limit: 12,
    search,
    sortBy,
    sortOrder: 'desc',
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleContentFilter = (filter: ContentFilter) => {
    setContentFilter(filter);
    setPage(1);
  };

  const videos = data?.data ?? [];
  const filtered = videos.filter((v) => {
    if (contentFilter === 'all') return true;
    if (contentFilter === 'shorts') return v.isShort;
    return !v.isShort;
  });

  return (
    <div className="space-y-4 p-6">
      {/* Search and sort row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Icon
            icon={Search}
            iconSize={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--icon-color)' }}
          />
          <Input
            placeholder="Search videos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(v) => {
            setSortBy(v as typeof sortBy);
            setPage(1);
          }}
        >
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

      {/* Content type filter tabs */}
      <div className="flex gap-1">
        {(Object.keys(CONTENT_FILTER_LABELS) as ContentFilter[]).map((filter) => (
          <Button
            key={filter}
            variant={contentFilter === filter ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleContentFilter(filter)}
          >
            {CONTENT_FILTER_LABELS[filter]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-lg" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((video) => (
              <VideoLibraryCard
                key={video.id}
                id={video.id}
                title={video.title}
                thumbnailUrl={video.thumbnailUrl}
                viewCount={video.viewCount}
                likeCount={video.likeCount}
                publishedAt={video.publishedAt}
                isShort={video.isShort}
              />
            ))}
          </div>
          {data && data.total > data.limit && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <Icon icon={DropdownChevronLeft} iconSize={16} />
              </Button>
              <span
                style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
              >
                Page {page} of {Math.ceil(data.total / data.limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!data.hasMore}
                onClick={() => setPage(page + 1)}
              >
                <Icon icon={DropdownChevronRight} iconSize={16} />
              </Button>
            </div>
          )}
        </>
      ) : (
        <p
          className="py-8 text-center"
          style={{ font: 'var(--font-text2-normal)', color: 'var(--disabled-text-color)' }}
        >
          No videos found.
        </p>
      )}
    </div>
  );
}
