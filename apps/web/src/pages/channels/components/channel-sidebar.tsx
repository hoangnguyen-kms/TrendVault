import { cn } from '@/lib/utils';
import { Youtube, Music2, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { formatCompactNumber } from '@/lib/format-utils';

interface Channel {
  id: string;
  platform: string;
  name: string;
  avatarUrl: string | null;
  subscriberCount: number | null;
}

interface ChannelSidebarProps {
  channels: Channel[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

export function ChannelSidebar({ channels, selectedId, onSelect }: ChannelSidebarProps) {
  const PlatformIcon = ({ platform }: { platform: string }) =>
    platform === 'YOUTUBE' ? (
      <Youtube className="h-4 w-4 text-red-500" />
    ) : (
      <Music2 className="h-4 w-4 text-gray-800" />
    );

  return (
    <div className="flex w-64 flex-col border-r bg-gray-50">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase">Channels</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {channels.length === 0 && (
          <p className="p-3 text-sm text-gray-400">No channels connected</p>
        )}
        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => onSelect(ch.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
              selectedId === ch.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100',
            )}
          >
            {ch.avatarUrl ? (
              <img src={ch.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <PlatformIcon platform={ch.platform} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{ch.name}</p>
              <p className="text-xs text-gray-400">
                {formatCompactNumber(ch.subscriberCount)} subs
              </p>
            </div>
            <PlatformIcon platform={ch.platform} />
          </button>
        ))}
      </div>
      <div className="border-t p-3">
        <Link to="/settings">
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
        </Link>
      </div>
    </div>
  );
}
