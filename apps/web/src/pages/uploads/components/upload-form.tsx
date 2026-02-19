import { useState } from 'react';
import { Icon } from '@vibe/core';
import { Upload, Alert } from '@vibe/icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useCreateUpload } from '../hooks/use-uploads';
import { useChannels } from '@/pages/settings/hooks/use-connected-accounts';
import { ShortsUploadToggle } from './shorts-upload-toggle';
import { UploadMetadataEditor } from './upload-metadata-editor';
import type { DownloadedVideo, ApiSuccess } from '@trendvault/shared-types';

const labelStyle = {
  font: 'var(--font-text2-medium)',
  color: 'var(--secondary-text-color)',
};

const inputStyle = {
  font: 'var(--font-text2-normal)',
  borderColor: 'var(--ui-border-color)',
  backgroundColor: 'var(--primary-background-color)',
  color: 'var(--primary-text-color)',
};

export function UploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState<'public' | 'private' | 'unlisted'>('private');
  const [uploadAsShort, setUploadAsShort] = useState(false);

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

  // Auto-fill title and pre-set uploadAsShort when video selected
  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
    const video = downloads?.find((d) => d.id === videoId);
    if (video) {
      setTitle(video.title);
      setDescription(video.description ?? '');
      setUploadAsShort(video.isShort ?? false);
    }
  };

  // Determine selected channel platform for platform-specific UI
  const selectedChannel = channels?.find((ch) => ch.id === selectedChannelId);
  const isTikTok = selectedChannel?.platform === 'TIKTOK';
  const isYouTube = selectedChannel?.platform === 'YOUTUBE';
  const isInstagram = selectedChannel?.platform === 'INSTAGRAM';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideoId || !selectedChannelId || !title) return;

    await createUpload.mutateAsync({
      downloadedVideoId: selectedVideoId,
      channelId: selectedChannelId,
      title,
      description: description || null,
      tags: tags
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      privacyStatus: isTikTok ? 'private' : privacyStatus,
      uploadMode: isTikTok ? 'inbox' : null,
      uploadAsShort: isYouTube || isInstagram ? uploadAsShort : false,
    });

    // Reset form
    setSelectedVideoId('');
    setSelectedChannelId('');
    setTitle('');
    setDescription('');
    setTags('');
    setPrivacyStatus('private');
    setUploadAsShort(false);
    onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border p-6"
      style={{
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--ui-border-color)',
      }}
    >
      <h2
        className="mb-4"
        style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}
      >
        New Upload
      </h2>

      <div className="space-y-4">
        {/* Video selection */}
        <div>
          <label className="mb-1 block" style={labelStyle}>
            Select Video
          </label>
          <select
            value={selectedVideoId}
            onChange={(e) => handleVideoSelect(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            style={inputStyle}
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
          <label className="mb-1 block" style={labelStyle}>
            Target Channel
          </label>
          <select
            value={selectedChannelId}
            onChange={(e) => setSelectedChannelId(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            style={inputStyle}
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
            <p
              className="mt-1"
              style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}
            >
              No channels found. Connect an account in Settings first.
            </p>
          )}
        </div>

        {/* TikTok warning */}
        {isTikTok && (
          <div
            className="rounded-md border px-3 py-2"
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
              <p style={{ font: 'var(--font-text3-normal)', color: 'var(--warning-color)' }}>
                TikTok: Video will be sent to your inbox as a draft. Privacy is set to private
                (unaudited app limitation).
              </p>
            </div>
          </div>
        )}

        {/* Instagram info */}
        {isInstagram && (
          <div
            className="rounded-md border px-3 py-2"
            style={{
              backgroundColor: 'var(--color-sofia_pink-selected)',
              borderColor: 'var(--color-sofia_pink)',
            }}
          >
            <div className="flex items-start gap-2">
              <Icon
                icon={Alert}
                iconSize={16}
                className="mt-0.5"
                style={{ color: 'var(--color-sofia_pink)' }}
              />
              <p style={{ font: 'var(--font-text3-normal)', color: 'var(--color-sofia_pink)' }}>
                Instagram: Video will be published as a Reel. Vertical (9:16) videos are recommended
                for best reach.
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="mb-1 block" style={labelStyle}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full rounded-md border px-3 py-2"
            style={inputStyle}
            required
          />
          <p
            className="mt-0.5"
            style={{ font: 'var(--font-text3-normal)', color: 'var(--disabled-text-color)' }}
          >
            {title.length}/100
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block" style={labelStyle}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={5000}
            className="w-full rounded-md border px-3 py-2"
            style={inputStyle}
          />
          <UploadMetadataEditor uploadAsShort={uploadAsShort} />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block" style={labelStyle}>
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="w-full rounded-md border px-3 py-2"
            style={inputStyle}
          />
        </div>

        {/* Privacy (YouTube only — TikTok and Instagram use fixed privacy) */}
        {!isTikTok && !isInstagram && (
          <div>
            <label className="mb-1 block" style={labelStyle}>
              Privacy
            </label>
            <select
              value={privacyStatus}
              onChange={(e) =>
                setPrivacyStatus(e.target.value as 'public' | 'private' | 'unlisted')
              }
              className="w-full rounded-md border px-3 py-2"
              style={inputStyle}
            >
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
          </div>
        )}

        {/* Shorts/Reels toggle (YouTube and Instagram) */}
        {(isYouTube || isInstagram) && (
          <ShortsUploadToggle
            sourceIsShort={downloads?.find((d) => d.id === selectedVideoId)?.isShort ?? false}
            sourceAspectRatio={
              downloads?.find((d) => d.id === selectedVideoId)?.aspectRatio ?? null
            }
            value={uploadAsShort}
            onChange={setUploadAsShort}
          />
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={createUpload.isPending || !selectedVideoId || !selectedChannelId || !title}
          className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 disabled:opacity-50"
          style={{
            font: 'var(--font-text2-medium)',
            backgroundColor: 'var(--primary-color)',
            color: 'var(--text-color-on-primary)',
          }}
        >
          <Icon icon={Upload} iconSize={16} />
          {createUpload.isPending ? 'Uploading...' : 'Start Upload'}
        </button>

        {createUpload.isError && (
          <p style={{ font: 'var(--font-text2-normal)', color: 'var(--negative-color)' }}>
            {createUpload.error instanceof Error ? createUpload.error.message : 'Upload failed'}
          </p>
        )}
      </div>
    </form>
  );
}
