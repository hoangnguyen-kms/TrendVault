import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoist stable mock implementations before vi.mock() factories run.
// This ensures they survive vi.clearAllMocks() between tests because
// vi.clearAllMocks only clears call counts and return values set dynamically —
// the stable `mockImplementation` set here is re-applied in beforeEach.
// ---------------------------------------------------------------------------
const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn().mockImplementation((fn: () => unknown) => fn()),
}));

vi.mock('../../../../config/environment.js', () => ({
  env: { APIFY_API_TOKEN: 'test-apify-token', NODE_ENV: 'test' },
}));

vi.mock('../../../../lib/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../../lib/circuit-breaker.js', () => ({
  CircuitBreaker: vi.fn().mockImplementation(() => ({ execute: mockExecute })),
}));

// retryWithBackoff: immediately invoke the supplied async fn
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

import { InstagramAdapter } from '../instagram-adapter.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildApifyItem(overrides?: Record<string, unknown>) {
  return {
    id: 'ABC123',
    shortCode: 'CXyz789',
    caption: 'My Reel caption #travel\nSecond line',
    displayUrl: 'https://cdn.instagram.com/thumb.jpg',
    ownerUsername: 'testuser',
    ownerId: 'IG_OWNER_1',
    videoDuration: 30,
    videoPlayCount: 100000,
    likesCount: 5000,
    commentsCount: 200,
    timestamp: '2024-01-15T10:00:00.000Z',
    hashtags: ['travel', 'reel'],
    ...overrides,
  };
}

function fetchReturning(items: unknown[]) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(items),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InstagramAdapter', () => {
  let adapter: InstagramAdapter;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    // Restore pass-through implementation after vi.clearAllMocks wipes it
    mockExecute.mockImplementation((fn: () => unknown) => fn());
    adapter = new InstagramAdapter();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('has platform set to INSTAGRAM', () => {
    expect(adapter.platform).toBe('INSTAGRAM');
  });

  describe('isAvailable()', () => {
    it('returns true when APIFY_API_TOKEN is set', async () => {
      expect(await adapter.isAvailable()).toBe(true);
    });

    it('returns false when APIFY_API_TOKEN is absent', async () => {
      const envMod = await import('../../../../config/environment.js');
      const saved = envMod.env.APIFY_API_TOKEN;
      envMod.env.APIFY_API_TOKEN = undefined;
      expect(await adapter.isAvailable()).toBe(false);
      envMod.env.APIFY_API_TOKEN = saved;
    });
  });

  describe('fetchTrending()', () => {
    it('maps Apify items to TrendingVideoDTO correctly', async () => {
      global.fetch = fetchReturning([buildApifyItem()]);

      const result = await adapter.fetchTrending({ region: 'US', maxResults: 5 });

      expect(result.videos).toHaveLength(1);
      const video = result.videos[0];
      expect(video.platform).toBe('INSTAGRAM');
      expect(video.platformVideoId).toBe('CXyz789');
      expect(video.region).toBe('US');
      expect(video.title).toBe('My Reel caption #travel');
      expect(video.description).toBe('My Reel caption #travel\nSecond line');
      expect(video.thumbnailUrl).toBe('https://cdn.instagram.com/thumb.jpg');
      expect(video.channelName).toBe('testuser');
      expect(video.channelId).toBe('IG_OWNER_1');
      expect(video.duration).toBe(30);
      expect(video.viewCount).toBe(100000n);
      expect(video.likeCount).toBe(5000n);
      expect(video.commentCount).toBe(200n);
      expect(video.shareCount).toBeNull();
      expect(video.publishedAt).toEqual(new Date('2024-01-15T10:00:00.000Z'));
      expect(video.trendingRank).toBe(1);
      expect(video.tags).toEqual(['travel', 'reel']);
    });

    it('sets isShort=true for all Reels regardless of duration', async () => {
      global.fetch = fetchReturning([buildApifyItem({ videoDuration: 120 })]);
      const result = await adapter.fetchTrending({ region: 'US' });
      expect(result.videos[0].isShort).toBe(true);
    });

    it('width and height are null (not exposed by Instagram API)', async () => {
      global.fetch = fetchReturning([buildApifyItem()]);
      const result = await adapter.fetchTrending({ region: 'US' });
      expect(result.videos[0].width).toBeNull();
      expect(result.videos[0].height).toBeNull();
    });

    it('respects maxResults — slices Apify response to the requested count', async () => {
      const items = Array.from({ length: 10 }, (_, i) =>
        buildApifyItem({ shortCode: `CODE${i}`, id: `ID${i}` }),
      );
      global.fetch = fetchReturning(items);

      const result = await adapter.fetchTrending({ region: 'US', maxResults: 3 });
      expect(result.videos).toHaveLength(3);
      expect(result.totalResults).toBe(3);
    });

    it('returns nextPageToken as null (Apify has no pagination)', async () => {
      global.fetch = fetchReturning([buildApifyItem()]);
      const result = await adapter.fetchTrending({ region: 'US' });
      expect(result.nextPageToken).toBeNull();
    });

    it('uses id as fallback when shortCode is missing', async () => {
      global.fetch = fetchReturning([buildApifyItem({ shortCode: undefined, id: 'FALLBACK_ID' })]);
      const result = await adapter.fetchTrending({ region: 'US' });
      expect(result.videos[0].platformVideoId).toBe('FALLBACK_ID');
    });

    it('falls back to index string when both shortCode and id are missing', async () => {
      global.fetch = fetchReturning([buildApifyItem({ shortCode: undefined, id: undefined })]);
      const result = await adapter.fetchTrending({ region: 'US' });
      expect(result.videos[0].platformVideoId).toBe('0');
    });

    it('handles undefined caption — title falls back to platformVideoId', async () => {
      global.fetch = fetchReturning([buildApifyItem({ caption: undefined })]);
      const result = await adapter.fetchTrending({ region: 'US' });
      const video = result.videos[0];
      expect(video.title).toBe(video.platformVideoId);
      expect(video.description).toBeNull();
    });

    it('truncates long caption first line to 100 characters for title', async () => {
      const longCaption = 'A'.repeat(150) + '\nSecond line';
      global.fetch = fetchReturning([buildApifyItem({ caption: longCaption })]);
      const result = await adapter.fetchTrending({ region: 'US' });
      expect(result.videos[0].title).toHaveLength(100);
    });

    it('handles undefined numeric fields gracefully', async () => {
      global.fetch = fetchReturning([
        buildApifyItem({
          videoPlayCount: undefined,
          likesCount: undefined,
          commentsCount: undefined,
          videoDuration: undefined,
          timestamp: undefined,
          hashtags: undefined,
        }),
      ]);
      const result = await adapter.fetchTrending({ region: 'US' });
      const video = result.videos[0];
      expect(video.viewCount).toBeNull();
      expect(video.likeCount).toBeNull();
      expect(video.commentCount).toBeNull();
      expect(video.duration).toBeNull();
      expect(video.publishedAt).toBeNull();
      expect(video.tags).toEqual([]);
    });

    it('throws when Apify responds with a non-OK status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({}),
      });
      await expect(adapter.fetchTrending({ region: 'US' })).rejects.toThrow();
    });

    it('returns empty result when APIFY_API_TOKEN is falsy', async () => {
      const envMod = await import('../../../../config/environment.js');
      const saved = envMod.env.APIFY_API_TOKEN;
      envMod.env.APIFY_API_TOKEN = undefined;

      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      const result = await adapter.fetchTrending({ region: 'US' });

      expect(result.videos).toEqual([]);
      expect(result.totalResults).toBe(0);
      expect(mockFetch).not.toHaveBeenCalled();

      envMod.env.APIFY_API_TOKEN = saved;
    });
  });
});
