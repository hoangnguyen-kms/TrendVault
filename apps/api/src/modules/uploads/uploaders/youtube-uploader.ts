import { google } from 'googleapis';
import { CircuitBreaker } from '../../../lib/circuit-breaker.js';
import { retryWithBackoff } from '../../../lib/retry-with-backoff.js';
import { ServiceUnavailableError } from '../../../lib/app-errors.js';
import type {
  IPlatformUploader,
  UploadOptions,
  UploadResult,
} from './platform-uploader-interface.js';

export class YouTubeUploader implements IPlatformUploader {
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker('youtube-upload', {
      failureThreshold: 3,
      resetTimeout: 120000,
      monitorWindow: 120000,
    });
  }

  private async callWithResilience<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await retryWithBackoff(async () => await this.circuitBreaker.execute(apiCall), {
        maxAttempts: 2,
        baseDelay: 2000,
        maxDelay: 10000,
      });
    } catch (error) {
      throw new ServiceUnavailableError(
        `YouTube upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    const {
      accessToken,
      videoStream,
      title,
      description,
      tags,
      privacyStatus,
      totalBytes,
      onProgress,
    } = options;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // 1,600 quota units per videos.insert
    const response = await this.callWithResilience(() =>
      youtube.videos.insert(
        {
          part: ['snippet', 'status'],
          requestBody: {
            snippet: { title, description: description ?? undefined, tags: tags ?? [] },
            status: { privacyStatus: privacyStatus || 'private' },
          },
          media: { mimeType: 'video/*', body: videoStream },
        },
        {
          onUploadProgress: (evt: { bytesRead?: number }) => {
            if (evt.bytesRead && totalBytes && totalBytes > 0) {
              const percent = Math.min(95, Math.floor((evt.bytesRead / totalBytes) * 100));
              onProgress?.({ percent, phase: 'uploading' });
            }
          },
        },
      ),
    );

    const videoId = response.data.id!;
    return {
      platformVideoId: videoId,
      publishUrl: `https://www.youtube.com/watch?v=${videoId}`,
      status: response.data.status?.uploadStatus || 'uploaded',
    };
  }
}
