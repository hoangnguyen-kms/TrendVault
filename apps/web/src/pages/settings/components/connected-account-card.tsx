import { Icon } from '@vibe/core';
import { Delete } from '@vibe/icons';
import { YouTubeIcon, TikTokIcon, InstagramIcon } from '@/components/icons/platform-icons';

interface ChannelInfo {
  id: string;
  name: string;
  avatarUrl: string | null;
  subscriberCount: number | null;
  videoCount: number | null;
}

interface ConnectedAccountCardProps {
  id: string;
  platform: string;
  displayName: string;
  avatarUrl: string | null;
  channels: ChannelInfo[];
  createdAt: string;
  onDisconnect: (id: string) => void;
  isDisconnecting: boolean;
}

function PlatformIconByName({
  platform,
  className,
  style,
}: {
  platform: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (platform === 'YOUTUBE') return <YouTubeIcon className={className} style={style} />;
  if (platform === 'INSTAGRAM') return <InstagramIcon className={className} style={style} />;
  return <TikTokIcon className={className} style={style} />;
}

const platformColorMap: Record<string, string> = {
  YOUTUBE: '#dc2626',
  INSTAGRAM: '#db2777',
  TIKTOK: 'var(--primary-text-color)',
};

export function ConnectedAccountCard({
  id,
  platform,
  displayName,
  avatarUrl,
  channels,
  createdAt,
  onDisconnect,
  isDisconnecting,
}: ConnectedAccountCardProps) {
  const platformColor = platformColorMap[platform] ?? 'var(--primary-text-color)';
  const platformLabel =
    platform === 'YOUTUBE' ? 'YouTube' : platform === 'INSTAGRAM' ? 'Instagram' : 'TikTok';

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--ui-border-color)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full" />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--allgrey-background-color)' }}
            >
              <PlatformIconByName
                platform={platform}
                className="h-5 w-5"
                style={{ color: platformColor }}
              />
            </div>
          )}
          <div>
            <p style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}>
              {displayName}
            </p>
            <div className="flex items-center gap-1.5">
              <PlatformIconByName
                platform={platform}
                className="h-3.5 w-3.5"
                style={{ color: platformColor }}
              />
              <span
                style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
              >
                {platformLabel}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDisconnect(id)}
          disabled={isDisconnecting}
          className="rounded p-1.5 transition-colors disabled:opacity-50"
          style={{ color: 'var(--icon-color)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--negative-color-selected)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--negative-color)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--icon-color)';
          }}
          title="Disconnect account"
        >
          <Icon icon={Delete} iconSize={16} />
        </button>
      </div>

      {/* Channels */}
      {channels.length > 0 && (
        <div
          className="mt-3 space-y-2 border-t pt-3"
          style={{ borderColor: 'var(--ui-border-color)' }}
        >
          <p
            style={{
              font: 'var(--font-text3-medium)',
              color: 'var(--disabled-text-color)',
              textTransform: 'uppercase',
            }}
          >
            Channels
          </p>
          {channels.map((ch) => (
            <div key={ch.id} className="flex items-center gap-2">
              {ch.avatarUrl ? (
                <img src={ch.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
              ) : (
                <div
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.3 }}
                />
              )}
              <span
                style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
              >
                {ch.name}
              </span>
              {ch.subscriberCount != null && (
                <span
                  style={{ font: 'var(--font-text3-normal)', color: 'var(--disabled-text-color)' }}
                >
                  {ch.subscriberCount.toLocaleString()} subs
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p
        className="mt-3"
        style={{ font: 'var(--font-text3-normal)', color: 'var(--disabled-text-color)' }}
      >
        Connected {new Date(createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
