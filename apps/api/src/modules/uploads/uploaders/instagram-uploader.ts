import { CircuitBreaker } from '../../../lib/circuit-breaker.js';
import { callWithResilience } from '../../../lib/call-with-resilience.js';
import { getStorageService } from '../../../services/storage/storage-factory.js';
import type {
  IPlatformUploader,
  UploadOptions,
  UploadResult,
} from './platform-uploader-interface.js';

const GRAPH_API_BASE = 'https://graph.instagram.com/v21.0';

/** Poll interval in ms between container status checks */
const POLL_INTERVAL_MS = 2000;
/** Maximum number of poll attempts before timeout (2 min at 2s each) */
const MAX_POLL_ATTEMPTS = 60;

/**
 * Instagram Reels uploader using the Graph API two-step container publishing flow:
 * 1. Create container with public video URL
 * 2. Poll container until FINISHED
 * 3. Publish container -> published media ID
 *
 * Instagram fetches the video from our MinIO signed URL, so we do NOT stream
 * bytes to Instagram directly.
 */
export class InstagramUploader implements IPlatformUploader {
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker('instagram-upload', {
      failureThreshold: 3,
      resetTimeout: 120000,
      monitorWindow: 120000,
    });
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    const { accessToken, title, description, storageKey, onProgress } = options;

    if (!storageKey) {
      throw new Error('Instagram upload requires storageKey (MinIO object key)');
    }

    // 1. Generate a time-limited signed URL so Instagram can fetch the video
    const storage = getStorageService();
    const videoUrl = await storage.getDownloadUrl(storageKey, 3600); // 1-hour expiry
    onProgress?.({ percent: 10, phase: 'preparing' });

    // 2. Resolve the Instagram user ID for this access token
    const igUserId = await this.getInstagramUserId(accessToken);

    // 3. Create the Reels container with the public video URL
    const caption = description || title;
    const containerId = await this.createContainer(igUserId, accessToken, videoUrl, caption);
    onProgress?.({ percent: 30, phase: 'processing' });

    // 4. Poll until Instagram finishes processing the video
    const finished = await this.pollContainerStatus(containerId, accessToken, onProgress);
    if (!finished) {
      throw new Error(
        `Instagram container processing timed out after ${(MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s`,
      );
    }

    // 5. Publish the ready container
    const mediaId = await this.publishContainer(igUserId, containerId, accessToken);
    onProgress?.({ percent: 100, phase: 'completed' });

    return {
      platformVideoId: mediaId,
      publishUrl: `https://www.instagram.com/reel/${mediaId}/`,
      status: 'published',
    };
  }

  /**
   * Fetch the Instagram user ID associated with the access token.
   * GET /me?fields=id
   */
  private async getInstagramUserId(accessToken: string): Promise<string> {
    const res = await callWithResilience(
      this.circuitBreaker,
      () =>
        fetch(`${GRAPH_API_BASE}/me?fields=id&access_token=${accessToken}`, {
          method: 'GET',
        }),
      'Instagram GetUserId',
      { maxAttempts: 2, baseDelay: 1000, maxDelay: 5000 },
    );

    const data = (await res.json()) as { id?: string; error?: { message: string } };

    if (data.error || !data.id) {
      throw new Error(`Instagram /me failed: ${data.error?.message ?? 'No user ID returned'}`);
    }

    return data.id;
  }

  /**
   * Create a Reels container. Instagram will asynchronously fetch the video
   * from the provided URL and transcode it.
   * POST /{igUserId}/media
   */
  private async createContainer(
    igUserId: string,
    accessToken: string,
    videoUrl: string,
    caption: string,
  ): Promise<string> {
    const body = new URLSearchParams({
      media_type: 'REELS',
      video_url: videoUrl,
      caption: caption.slice(0, 2200), // Graph API caps at 2200 chars
      share_to_feed: 'true',
      access_token: accessToken,
    });

    const res = await callWithResilience(
      this.circuitBreaker,
      () =>
        fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        }),
      'Instagram CreateContainer',
      { maxAttempts: 2, baseDelay: 2000, maxDelay: 10000 },
    );

    const data = (await res.json()) as { id?: string; error?: { message: string } };

    if (data.error || !data.id) {
      throw new Error(
        `Instagram container creation failed: ${data.error?.message ?? 'No container ID returned'}`,
      );
    }

    return data.id;
  }

  /**
   * Poll the container status until FINISHED or ERROR.
   * Progress is emitted between 30% and 90% during this phase.
   * Returns true if FINISHED, false if timed out.
   */
  private async pollContainerStatus(
    containerId: string,
    accessToken: string,
    onProgress?: (p: { percent: number; phase: string }) => void,
  ): Promise<boolean> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const res = await callWithResilience(
        this.circuitBreaker,
        () =>
          fetch(`${GRAPH_API_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`, {
            method: 'GET',
          }),
        'Instagram PollContainer',
        { maxAttempts: 2, baseDelay: 1000, maxDelay: 3000 },
      );

      const data = (await res.json()) as {
        status_code?: string;
        error?: { message: string };
      };

      if (data.error) {
        throw new Error(`Instagram poll error: ${data.error.message}`);
      }

      const statusCode = data.status_code;

      if (statusCode === 'FINISHED') {
        return true;
      }

      if (statusCode === 'ERROR' || statusCode === 'EXPIRED') {
        throw new Error(`Instagram container processing failed with status: ${statusCode}`);
      }

      // Emit incremental progress between 30% and 90%
      const progressPercent = 30 + Math.floor((attempt / MAX_POLL_ATTEMPTS) * 60);
      onProgress?.({ percent: progressPercent, phase: 'processing' });
    }

    return false; // timed out
  }

  /**
   * Publish a FINISHED container to make the Reel live.
   * POST /{igUserId}/media_publish
   */
  private async publishContainer(
    igUserId: string,
    containerId: string,
    accessToken: string,
  ): Promise<string> {
    const body = new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    });

    const res = await callWithResilience(
      this.circuitBreaker,
      () =>
        fetch(`${GRAPH_API_BASE}/${igUserId}/media_publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        }),
      'Instagram PublishContainer',
      { maxAttempts: 2, baseDelay: 2000, maxDelay: 10000 },
    );

    const data = (await res.json()) as { id?: string; error?: { message: string } };

    if (data.error || !data.id) {
      throw new Error(`Instagram publish failed: ${data.error?.message ?? 'No media ID returned'}`);
    }

    return data.id;
  }
}
