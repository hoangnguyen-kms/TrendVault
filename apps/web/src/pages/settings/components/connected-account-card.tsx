import { Trash2, Youtube, Music2, Instagram } from 'lucide-react';

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
  const PlatformIcon =
    platform === 'YOUTUBE' ? Youtube : platform === 'INSTAGRAM' ? Instagram : Music2;
  const platformColor =
    platform === 'YOUTUBE'
      ? 'text-red-600'
      : platform === 'INSTAGRAM'
        ? 'text-pink-600'
        : 'text-black';
  const platformLabel =
    platform === 'YOUTUBE' ? 'YouTube' : platform === 'INSTAGRAM' ? 'Instagram' : 'TikTok';

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <PlatformIcon className={`h-5 w-5 ${platformColor}`} />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{displayName}</p>
            <div className="flex items-center gap-1.5">
              <PlatformIcon className={`h-3.5 w-3.5 ${platformColor}`} />
              <span className="text-sm text-gray-500">{platformLabel}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDisconnect(id)}
          disabled={isDisconnecting}
          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          title="Disconnect account"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Channels */}
      {channels.length > 0 && (
        <div className="mt-3 space-y-2 border-t pt-3">
          <p className="text-xs font-medium uppercase text-gray-400">Channels</p>
          {channels.map((ch) => (
            <div key={ch.id} className="flex items-center gap-2 text-sm">
              {ch.avatarUrl ? (
                <img src={ch.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gray-200" />
              )}
              <span className="text-gray-700">{ch.name}</span>
              {ch.subscriberCount != null && (
                <span className="text-xs text-gray-400">
                  {ch.subscriberCount.toLocaleString()} subs
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Connected {new Date(createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
