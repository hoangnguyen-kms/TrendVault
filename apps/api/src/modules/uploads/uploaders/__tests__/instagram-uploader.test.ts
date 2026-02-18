import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Readable } from 'stream';

// ---------------------------------------------------------------------------
// vi.hoisted — stable fn references safe to use inside vi.mock() factories
// ---------------------------------------------------------------------------
const { mockExecute, mockGetDownloadUrl } = vi.hoisted(() => ({
  mockExecute: vi.fn().mockImplementation((fn: () => unknown) => fn()),
  mockGetDownloadUrl: vi.fn().mockResolvedValue('https://storage.example.com/signed.mp4'),
}));

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------
vi.mock('../../../../config/environment.js', () => ({
  env: { NODE_ENV: 'test', STORAGE_BACKEND: 'minio' },
}));

vi.mock('../../../../lib/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../../lib/circuit-breaker.js', () => ({
  CircuitBreaker: vi.fn().mockImplementation(() => ({ execute: mockExecute })),
}));

vi.mock('../../../../lib/retry-with-backoff.js', () => ({
  retryWithBackoff: vi.fn().mockImplementation((fn: () => Promise<unknown>) => fn()),
}));

vi.mock('../../../../lib/app-errors.js', () => ({
  ServiceUnavailableError: class ServiceUnavailableError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = 'ServiceUnavailableError';
    }
  },
}));

// callWithResilience: pass straight through to the api-call function
vi.mock('../../../../lib/call-with-resilience.js', () => ({
  callWithResilience: vi.fn().mockImplementation((_cb: unknown, fn: () => unknown) => fn()),
}));

vi.mock('../../../../services/storage/storage-factory.js', () => ({
  getStorageService: vi.fn().mockReturnValue({ getDownloadUrl: mockGetDownloadUrl }),
}));

import { InstagramUploader } from '../instagram-uploader.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
  };
}

const BASE_OPTIONS = {
  accessToken: 'ACCESS_TOKEN',
  videoStream: Readable.from(Buffer.alloc(0)),
  title: 'Test Reel',
  description: 'A short description',
  storageKey: 'videos/test-video.mp4',
  channelId: 'IG_CHAN_1',
  platform: 'INSTAGRAM' as const,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InstagramUploader', () => {
  let uploader: InstagramUploader;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    // Use fake timers so pollContainerStatus setTimeout does not block
    vi.useFakeTimers();
    mockExecute.mockImplementation((fn: () => unknown) => fn());
    mockGetDownloadUrl.mockResolvedValue('https://storage.example.com/signed.mp4');
    uploader = new InstagramUploader();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // Helper: run upload() while advancing fake timers concurrently.
  // We attach a no-op rejection handler immediately to prevent unhandled
  // rejection warnings when the timers flush fires the error before the
  // caller's await catches it.
  function runWithTimers<T>(fn: () => Promise<T>): Promise<T> {
    const promise = fn();
    // Attach catch to silence "unhandled rejection" from timer flush;
    // the real assertion is done by the caller via .rejects.toThrow() etc.
    promise.catch(() => undefined);
    vi.runAllTimersAsync();
    return promise;
  }

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  it('returns platformVideoId and publishUrl on success', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'FINISHED' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'MEDIA_123' }));

    const result = await runWithTimers(() => uploader.upload(BASE_OPTIONS));

    expect(result).toMatchObject({
      platformVideoId: 'MEDIA_123',
      publishUrl: 'https://www.instagram.com/reel/MEDIA_123/',
      status: 'published',
    });
  });

  it('calls GET /me to resolve the Instagram user ID', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'FINISHED' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'MEDIA_123' }));
    global.fetch = mockFetch;

    await runWithTimers(() => uploader.upload(BASE_OPTIONS));

    const firstUrl = mockFetch.mock.calls[0][0] as string;
    expect(firstUrl).toContain('/me?fields=id');
    expect(firstUrl).toContain('access_token=ACCESS_TOKEN');
  });

  it('creates container with media_type=REELS', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'FINISHED' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'MEDIA_123' }));
    global.fetch = mockFetch;

    await runWithTimers(() => uploader.upload(BASE_OPTIONS));

    const secondUrl = mockFetch.mock.calls[1][0] as string;
    expect(secondUrl).toContain('/IG_USER_1/media');
    const body = String(mockFetch.mock.calls[1][1]?.body ?? '');
    expect(body).toContain('media_type=REELS');
  });

  it('passes the signed storage URL as video_url', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'FINISHED' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'MEDIA_123' }));
    global.fetch = mockFetch;

    await runWithTimers(() => uploader.upload(BASE_OPTIONS));

    const body = String(mockFetch.mock.calls[1][1]?.body ?? '');
    expect(body).toContain('video_url=');
    expect(body).toContain('storage.example.com');
  });

  it('uses description as caption when provided', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'FINISHED' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'MEDIA_123' }));
    global.fetch = mockFetch;

    await runWithTimers(() =>
      uploader.upload({ ...BASE_OPTIONS, description: 'Explicit caption' }),
    );

    const body = String(mockFetch.mock.calls[1][1]?.body ?? '');
    expect(body).toContain('Explicit+caption');
  });

  it('falls back to title as caption when description is absent', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'FINISHED' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'MEDIA_123' }));
    global.fetch = mockFetch;

    await runWithTimers(() => uploader.upload({ ...BASE_OPTIONS, description: undefined }));

    const body = String(mockFetch.mock.calls[1][1]?.body ?? '');
    expect(body).toContain('Test+Reel');
  });

  it('publishes the finished container', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'FINISHED' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'MEDIA_123' }));
    global.fetch = mockFetch;

    await runWithTimers(() => uploader.upload(BASE_OPTIONS));

    const fourthUrl = mockFetch.mock.calls[3][0] as string;
    expect(fourthUrl).toContain('/IG_USER_1/media_publish');
    const body = String(mockFetch.mock.calls[3][1]?.body ?? '');
    expect(body).toContain('creation_id=CONTAINER_1');
  });

  it('emits progress callbacks for preparing and completed phases', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'FINISHED' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'MEDIA_123' }));

    const events: Array<{ percent: number; phase: string }> = [];
    await runWithTimers(() =>
      uploader.upload({ ...BASE_OPTIONS, onProgress: (p) => events.push(p) }),
    );

    const phases = events.map((e) => e.phase);
    expect(phases).toContain('preparing');
    expect(phases).toContain('completed');
  });

  // -------------------------------------------------------------------------
  // Polling behaviour
  // -------------------------------------------------------------------------

  it('keeps polling through IN_PROGRESS until FINISHED', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'IN_PROGRESS' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'IN_PROGRESS' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'FINISHED' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'MEDIA_456' }));

    const result = await runWithTimers(() => uploader.upload(BASE_OPTIONS));
    expect((result as { platformVideoId: string }).platformVideoId).toBe('MEDIA_456');
  });

  it('throws when container status is ERROR', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'ERROR' }));

    await expect(runWithTimers(() => uploader.upload(BASE_OPTIONS))).rejects.toThrow(
      'Instagram container processing failed with status: ERROR',
    );
  });

  it('throws when container status is EXPIRED', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'EXPIRED' }));

    await expect(runWithTimers(() => uploader.upload(BASE_OPTIONS))).rejects.toThrow(
      'Instagram container processing failed with status: EXPIRED',
    );
  });

  it('throws when poll response contains an API error object', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'Rate limit exceeded' } }));

    await expect(runWithTimers(() => uploader.upload(BASE_OPTIONS))).rejects.toThrow(
      'Instagram poll error',
    );
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  it('throws when storageKey is missing', async () => {
    await expect(uploader.upload({ ...BASE_OPTIONS, storageKey: undefined })).rejects.toThrow(
      'Instagram upload requires storageKey',
    );
  });

  it('throws when /me returns an error object', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'Invalid access token' } }));

    await expect(uploader.upload(BASE_OPTIONS)).rejects.toThrow('Instagram /me failed');
  });

  it('throws when /me returns no id field', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce(jsonResponse({}));

    await expect(uploader.upload(BASE_OPTIONS)).rejects.toThrow('Instagram /me failed');
  });

  it('throws when container creation returns an error', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'Video too long' } }));

    await expect(uploader.upload(BASE_OPTIONS)).rejects.toThrow(
      'Instagram container creation failed',
    );
  });

  it('throws when publish returns an error', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'IG_USER_1' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'CONTAINER_1' }))
      .mockResolvedValueOnce(jsonResponse({ status_code: 'FINISHED' }))
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'Publish failed' } }));

    await expect(runWithTimers(() => uploader.upload(BASE_OPTIONS))).rejects.toThrow(
      'Instagram publish failed',
    );
  });
});
