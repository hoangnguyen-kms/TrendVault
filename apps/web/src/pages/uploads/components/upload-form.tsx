import { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useCreateUpload } from '../hooks/use-uploads';
import { useChannels } from '@/pages/settings/hooks/use-connected-accounts';
import type { DownloadedVideo } from '@trendvault/shared-types';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export function UploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState<'public' | 'private' | 'unlisted'>('private');

  const createUpload = useCreateUpload();
  const { data: channels } = useChannels();

  // Fetch completed downloads for video selection
  const { data: downloads } = useQuery({
    queryKey: ['downloads', { status: 'COMPLETED' }],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccess<{ data: DownloadedVideo[] }>>(
        '/downloads?status=COMPLETED&limit=50',
      );
      return response.data.data;
    },
  });

  // Auto-fill title when video selected
  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
    const video = downloads?.find((d) => d.id === videoId);
    if (video) {
      setTitle(video.title);
      setDescription(video.description ?? '');
    }
  };

  // Determine selected channel platform for TikTok warnings
  const selectedChannel = channels?.find((ch) => ch.id === selectedChannelId);
  const isTikTok = selectedChannel?.platform === 'TIKTOK';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideoId || !selectedChannelId || !title) return;

    await createUpload.mutateAsync({
      downloadedVideoId: selectedVideoId,
      channelId: selectedChannelId,
      title,
      description: description || null,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      privacyStatus: isTikTok ? 'private' : privacyStatus,
      uploadMode: isTikTok ? 'inbox' : null,
    });

    // Reset form
    setSelectedVideoId('');
    setSelectedChannelId('');
    setTitle('');
    setDescription('');
    setTags('');
    setPrivacyStatus('private');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">New Upload</h2>

      <div className="space-y-4">
        {/* Video selection */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Select Video
          </label>
          <select
            value={selectedVideoId}
            onChange={(e) => handleVideoSelect(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Choose a downloaded video...</option>
            {downloads?.map((dl) => (
              <option key={dl.id} value={dl.id}>
                {dl.title} ({dl.platform})
              </option>
            ))}
          </select>
        </div>

        {/* Channel selection */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Target Channel
          </label>
          <select
            value={selectedChannelId}
            onChange={(e) => setSelectedChannelId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Choose a channel...</option>
            {channels?.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name} ({ch.platform})
              </option>
            ))}
          </select>
          {channels?.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              No channels found. Connect an account in Settings first.
            </p>
          )}
        </div>

        {/* TikTok warning */}
        {isTikTok && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
              <p className="text-xs text-yellow-700">
                TikTok: Video will be sent to your inbox as a draft.
                Privacy is set to private (unaudited app limitation).
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          />
          <p className="mt-0.5 text-xs text-gray-400">{title.length}/100</p>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={5000}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Privacy (YouTube only) */}
        {!isTikTok && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Privacy</label>
            <select
              value={privacyStatus}
              onChange={(e) => setPrivacyStatus(e.target.value as 'public' | 'private' | 'unlisted')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={createUpload.isPending || !selectedVideoId || !selectedChannelId || !title}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {createUpload.isPending ? 'Uploading...' : 'Start Upload'}
        </button>

        {createUpload.isError && (
          <p className="text-sm text-red-600">
            {createUpload.error instanceof Error ? createUpload.error.message : 'Upload failed'}
          </p>
        )}
      </div>
    </form>
  );
}
