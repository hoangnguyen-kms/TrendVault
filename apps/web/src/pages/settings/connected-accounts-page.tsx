import { AlertCircle, RefreshCw, Youtube, Music2 } from 'lucide-react';
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

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Connected Accounts</h1>
        <p className="text-sm text-gray-500">
          Connect your YouTube and TikTok accounts to upload videos
        </p>
      </div>

      {/* Success/Error banners */}
      {connected && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Successfully connected {connected === 'youtube' ? 'YouTube' : 'TikTok'} account!
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* TikTok unaudited warning */}
      <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium">TikTok Upload Limitation</p>
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
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Youtube className="h-5 w-5 text-red-600" />
            Connect YouTube
          </a>
        )}
        {!hasTikTok && (
          <a
            href={`${API_BASE}/oauth/tiktok`}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Music2 className="h-5 w-5" />
            Connect TikTok
          </a>
        )}
      </div>

      {/* Account list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center rounded-lg border bg-white px-6 py-12">
          <AlertCircle className="mb-2 h-8 w-8 text-red-400" />
          <p className="mb-3 text-gray-700">Failed to load accounts</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
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
        <div className="flex flex-col items-center rounded-lg border bg-white px-6 py-16">
          <p className="mb-1 text-lg font-medium text-gray-900">No accounts connected</p>
          <p className="text-sm text-gray-500">
            Connect a YouTube or TikTok account to start uploading videos
          </p>
        </div>
      )}
    </div>
  );
}
