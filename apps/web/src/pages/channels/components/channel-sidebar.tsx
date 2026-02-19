import { cn } from '@/lib/utils';
import { Icon } from '@vibe/core';
import { Add } from '@vibe/icons';
import { YouTubeIcon, TikTokIcon, InstagramIcon } from '@/components/icons/platform-icons';
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

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === 'YOUTUBE')
    return <YouTubeIcon className="h-4 w-4" style={{ color: '#dc2626' }} />;
  if (platform === 'INSTAGRAM')
    return <InstagramIcon className="h-4 w-4" style={{ color: '#db2777' }} />;
  return <TikTokIcon className="h-4 w-4" style={{ color: 'var(--primary-text-color)' }} />;
}

export function ChannelSidebar({ channels, selectedId, onSelect }: ChannelSidebarProps) {
  return (
    <div
      className="flex w-64 flex-col border-r"
      style={{
        backgroundColor: 'var(--allgrey-background-color)',
        borderColor: 'var(--layout-border-color)',
      }}
    >
      <div className="border-b p-4" style={{ borderColor: 'var(--layout-border-color)' }}>
        <h2
          className="uppercase"
          style={{ font: 'var(--font-text2-medium)', color: 'var(--secondary-text-color)' }}
        >
          Channels
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {channels.length === 0 && (
          <p
            className="p-3"
            style={{ font: 'var(--font-text2-normal)', color: 'var(--disabled-text-color)' }}
          >
            No channels connected
          </p>
        )}
        {channels.map((ch) => {
          const isActive = selectedId === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => onSelect(ch.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
              )}
              style={{
                font: 'var(--font-text2-normal)',
                ...(isActive
                  ? {
                      backgroundColor: 'var(--primary-selected-color)',
                      color: 'var(--primary-color)',
                    }
                  : {
                      color: 'var(--secondary-text-color)',
                    }),
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--primary-background-hover-color)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }
              }}
            >
              {ch.avatarUrl ? (
                <img src={ch.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.3 }}
                >
                  <PlatformIcon platform={ch.platform} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate" style={{ fontWeight: 500 }}>
                  {ch.name}
                </p>
                <p
                  style={{ font: 'var(--font-text3-normal)', color: 'var(--disabled-text-color)' }}
                >
                  {formatCompactNumber(ch.subscriberCount)} subs
                </p>
              </div>
              <PlatformIcon platform={ch.platform} />
            </button>
          );
        })}
      </div>
      <div className="border-t p-3" style={{ borderColor: 'var(--layout-border-color)' }}>
        <Link to="/settings">
          <Button variant="outline" size="sm" className="w-full">
            <Icon icon={Add} iconSize={16} className="mr-2" />
            Connect Account
          </Button>
        </Link>
      </div>
    </div>
  );
}
