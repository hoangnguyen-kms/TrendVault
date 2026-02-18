import type { DownloadedVideo } from '../../lib/prisma-client.js';

const SAFE_VIDEO_ID_PATTERN = /^[\w-]+$/;

/** Build platform-specific video URL with input validation */
export function buildVideoUrl(
  platform: string,
  platformVideoId: string,
  channelId?: string | null,
): string {
  if (!SAFE_VIDEO_ID_PATTERN.test(platformVideoId)) {
    throw new Error(`Invalid platformVideoId format: ${platformVideoId}`);
  }

  switch (platform) {
    case 'YOUTUBE':
      return `https://www.youtube.com/watch?v=${platformVideoId}`;
    case 'TIKTOK': {
      // TikTok URLs require a username — use channelId if available, fallback to placeholder
      const username = channelId ?? 'user';
      return `https://www.tiktok.com/@${username}/video/${platformVideoId}`;
    }
    case 'INSTAGRAM':
      // Instagram Reel URL — platformVideoId is the shortCode (alphanumeric + _ + -)
      return `https://www.instagram.com/reel/${platformVideoId}/`;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/** Serialize Prisma DownloadedVideo for JSON response (BigInt → number, Date → ISO string) */
export function serializeDownload(d: DownloadedVideo) {
  return {
    ...d,
    fileSize: d.fileSize ? Number(d.fileSize) : null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    downloadedAt: d.downloadedAt ? d.downloadedAt.toISOString() : null,
  };
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
