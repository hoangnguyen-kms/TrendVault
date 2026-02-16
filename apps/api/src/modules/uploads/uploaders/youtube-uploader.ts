import { google } from 'googleapis';
import type {
  IPlatformUploader,
  UploadOptions,
  UploadResult,
} from './platform-uploader-interface.js';

export class YouTubeUploader implements IPlatformUploader {
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
    const response = await youtube.videos.insert(
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
    );

    const videoId = response.data.id!;
    return {
      platformVideoId: videoId,
      publishUrl: `https://www.youtube.com/watch?v=${videoId}`,
      status: response.data.status?.uploadStatus || 'uploaded',
    };
  }
}
