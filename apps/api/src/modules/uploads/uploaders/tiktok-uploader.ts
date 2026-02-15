import type { IPlatformUploader, UploadOptions, UploadResult } from './platform-uploader-interface.js';

/**
 * TikTok Content Posting API — Inbox Upload only (unaudited apps).
 * Direct Post deferred until TikTok audit approval.
 */
export class TikTokUploader implements IPlatformUploader {
  async upload(options: UploadOptions): Promise<UploadResult> {
    const { accessToken, videoStream, title, totalBytes, onProgress } = options;

    // Always use inbox upload for unaudited apps
    return this.inboxUpload(accessToken, videoStream, title, totalBytes ?? 0, onProgress);
  }

  /**
   * Inbox Upload: video goes to creator's TikTok inbox for manual posting.
   * POST /v2/post/publish/inbox/video/init/ → get upload_url
   * PUT upload_url → upload video chunks
   */
  private async inboxUpload(
    accessToken: string,
    videoStream: NodeJS.ReadableStream,
    title: string,
    totalBytes: number,
    onProgress?: (progress: { percent: number; phase: string }) => void,
  ): Promise<UploadResult> {
    // 1. Initialize inbox upload
    const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/inbox/video/init/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: totalBytes,
          chunk_size: totalBytes, // Single-chunk upload for simplicity
          total_chunk_count: 1,
        },
      }),
    });

    const initData = await initRes.json() as {
      data?: { publish_id: string; upload_url: string };
      error?: { code: string; message: string };
    };

    if (initData.error || !initData.data) {
      throw new Error(`TikTok init failed: ${initData.error?.message ?? 'Unknown error'}`);
    }

    const { publish_id, upload_url } = initData.data;

    onProgress?.({ percent: 20, phase: 'uploading' });

    // 2. Buffer video into memory (guard against OOM for large files)
    const MAX_BUFFER_SIZE = 50 * 1024 * 1024; // 50MB
    if (totalBytes > MAX_BUFFER_SIZE) {
      throw new Error(`Video too large for single-chunk upload (${Math.round(totalBytes / 1024 / 1024)}MB > ${MAX_BUFFER_SIZE / 1024 / 1024}MB limit)`);
    }

    const chunks: Buffer[] = [];
    let buffered = 0;
    for await (const chunk of videoStream) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      buffered += buf.length;
      if (buffered > MAX_BUFFER_SIZE) {
        throw new Error('Video exceeded maximum buffer size during streaming');
      }
      chunks.push(buf);
    }
    const videoBuffer = Buffer.concat(chunks);

    const uploadRes = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Range': `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
      },
      body: videoBuffer,
    });

    if (!uploadRes.ok) {
      throw new Error(`TikTok upload failed: HTTP ${uploadRes.status}`);
    }

    onProgress?.({ percent: 90, phase: 'processing' });

    // 3. Poll for publish status
    const publishId = await this.pollPublishStatus(accessToken, publish_id);

    onProgress?.({ percent: 100, phase: 'completed' });

    return {
      platformVideoId: publishId,
      publishUrl: null, // Inbox uploads don't have a public URL until user posts
      status: 'inbox',
    };
  }

  /** Poll TikTok for publish status (max 10 attempts, 3s intervals) */
  private async pollPublishStatus(accessToken: string, publishId: string): Promise<string> {
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 3000));

      const res = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publish_id: publishId }),
      });

      const data = await res.json() as {
        data?: { status: string; publicaly_available_post_id?: string[] };
      };

      const status = data.data?.status;
      if (status === 'PUBLISH_COMPLETE' || status === 'SEND_TO_USER_INBOX') {
        return publishId;
      }
      if (status === 'FAILED') {
        throw new Error('TikTok publish failed');
      }
    }

    // If polling times out, return the publish_id anyway — video may still be processing
    return publishId;
  }
}
