import { Icon } from '@vibe/core';
import { Alert, Retry } from '@vibe/icons';
import { YouTubeIcon, TikTokIcon, InstagramIcon } from '@/components/icons/platform-icons';
import { useSearchParams } from 'react-router';
import { ConnectedAccountCard } from './components/connected-account-card';
import { useConnectedAccounts, useDisconnectAccount } from './hooks/use-connected-accounts';

const API_BASE = '/api';

export default function ConnectedAccountsPage() {
  const [searchParams] = useSearchParams();
  const connected = searchParams.get('connected');
  const error = searchParams.get('error');

  const { data: accounts, isLoading, isError, refetch } = useConnectedAccounts();
  const disconnectMutation = useDisconnectAccount();

  const hasYouTube = accounts?.some((a) => a.platform === 'YOUTUBE');
  const hasTikTok = accounts?.some((a) => a.platform === 'TIKTOK');
  const hasInstagram = accounts?.some((a) => a.platform === 'INSTAGRAM');

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
          Connected Accounts
        </h1>
        <p style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}>
          Connect your YouTube, TikTok, and Instagram accounts to upload videos
        </p>
      </div>

      {/* Success/Error banners */}
      {connected && (
        <div
          className="mb-4 rounded-lg border px-4 py-3"
          style={{
            font: 'var(--font-text2-normal)',
            backgroundColor: 'var(--positive-color-selected)',
            borderColor: 'var(--positive-color)',
            color: 'var(--positive-color)',
          }}
        >
          Successfully connected{' '}
          {connected === 'youtube' ? 'YouTube' : connected === 'tiktok' ? 'TikTok' : 'Instagram'}{' '}
          account!
        </div>
      )}
      {error && (
        <div
          className="mb-4 rounded-lg border px-4 py-3"
          style={{
            font: 'var(--font-text2-normal)',
            backgroundColor: 'var(--negative-color-selected)',
            borderColor: 'var(--negative-color)',
            color: 'var(--negative-color)',
          }}
        >
          {decodeURIComponent(error)}
        </div>
      )}

      {/* TikTok unaudited warning */}
      <div
        className="mb-6 rounded-lg border px-4 py-3"
        style={{
          backgroundColor: 'var(--warning-color-selected)',
          borderColor: 'var(--warning-color)',
        }}
      >
        <div className="flex items-start gap-2">
          <Icon
            icon={Alert}
            iconSize={16}
            className="mt-0.5"
            style={{ color: 'var(--warning-color)' }}
          />
          <div style={{ font: 'var(--font-text2-normal)', color: 'var(--warning-color)' }}>
            <p style={{ fontWeight: 500 }}>TikTok Upload Limitation</p>
            <p>
              TikTok uploads go to your inbox as drafts (Inbox Upload mode). Direct publishing
              requires TikTok app audit approval.
            </p>
          </div>
        </div>
      </div>

      {/* Connect buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {!hasYouTube && (
          <a
            href={`${API_BASE}/oauth/google`}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 transition-colors"
            style={{
              font: 'var(--font-text2-medium)',
              backgroundColor: 'var(--primary-background-color)',
              borderColor: 'var(--ui-border-color)',
              color: 'var(--secondary-text-color)',
              boxShadow: 'var(--box-shadow-xs)',
            }}
          >
            <YouTubeIcon className="h-5 w-5" style={{ color: '#dc2626' }} />
            Connect YouTube
          </a>
        )}
        {!hasTikTok && (
          <a
            href={`${API_BASE}/oauth/tiktok`}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 transition-colors"
            style={{
              font: 'var(--font-text2-medium)',
              backgroundColor: 'var(--primary-background-color)',
              borderColor: 'var(--ui-border-color)',
              color: 'var(--secondary-text-color)',
              boxShadow: 'var(--box-shadow-xs)',
            }}
          >
            <TikTokIcon className="h-5 w-5" />
            Connect TikTok
          </a>
        )}
        {!hasInstagram && (
          <a
            href={`${API_BASE}/oauth/instagram`}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 transition-colors"
            style={{
              font: 'var(--font-text2-medium)',
              backgroundColor: 'var(--primary-background-color)',
              borderColor: 'var(--ui-border-color)',
              color: 'var(--secondary-text-color)',
              boxShadow: 'var(--box-shadow-xs)',
            }}
          >
            <InstagramIcon className="h-5 w-5" style={{ color: '#db2777' }} />
            Connect Instagram
          </a>
        )}
      </div>

      {/* Account list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border p-4"
              style={{
                backgroundColor: 'var(--primary-background-color)',
                borderColor: 'var(--ui-border-color)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full"
                  style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.2 }}
                />
                <div className="space-y-2">
                  <div
                    className="h-4 w-32 rounded"
                    style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.2 }}
                  />
                  <div
                    className="h-3 w-20 rounded"
                    style={{ backgroundColor: 'var(--placeholder-color)', opacity: 0.2 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          className="flex flex-col items-center rounded-lg border px-6 py-12"
          style={{
            backgroundColor: 'var(--primary-background-color)',
            borderColor: 'var(--ui-border-color)',
          }}
        >
          <Icon
            icon={Alert}
            iconSize={32}
            className="mb-2"
            style={{ color: 'var(--negative-color)' }}
          />
          <p className="mb-3" style={{ color: 'var(--secondary-text-color)' }}>
            Failed to load accounts
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5"
            style={{
              font: 'var(--font-text2-normal)',
              backgroundColor: 'var(--primary-color)',
              color: 'var(--text-color-on-primary)',
            }}
          >
            <Icon icon={Retry} iconSize={14} /> Retry
          </button>
        </div>
      ) : accounts && accounts.length > 0 ? (
        <div className="space-y-3">
          {accounts.map((account) => (
            <ConnectedAccountCard
              key={account.id}
              id={account.id}
              platform={account.platform}
              displayName={account.displayName}
              avatarUrl={account.avatarUrl}
              channels={account.channels}
              createdAt={account.createdAt}
              onDisconnect={(id) => disconnectMutation.mutate(id)}
              isDisconnecting={disconnectMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center rounded-lg border px-6 py-16"
          style={{
            backgroundColor: 'var(--primary-background-color)',
            borderColor: 'var(--ui-border-color)',
          }}
        >
          <p
            className="mb-1"
            style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}
          >
            No accounts connected
          </p>
          <p style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}>
            Connect a YouTube, TikTok, or Instagram account to start uploading videos
          </p>
        </div>
      )}
    </div>
  );
}
