import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Hoisted so it survives vi.restoreAllMocks() — re-applied in beforeEach
const { mockRetryWithBackoff } = vi.hoisted(() => ({
  mockRetryWithBackoff: vi.fn().mockImplementation((fn: () => Promise<unknown>) => fn()),
}));

vi.mock('../../../../lib/retry-with-backoff.js', () => ({
  retryWithBackoff: mockRetryWithBackoff,
}));

import { InstagramStatsFetcher } from '../instagram-stats-fetcher.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
}

function buildMediaItem(overrides?: Record<string, unknown>) {
  return {
    id: 'MEDIA_1',
    caption: 'Caption text #reel',
    timestamp: '2024-02-01T12:00:00.000Z',
    media_type: 'VIDEO',
    thumbnail_url: 'https://cdn.instagram.com/thumb1.jpg',
    permalink: 'https://www.instagram.com/reel/ABC/',
    ...overrides,
  };
}

function buildInsightsResponse(metrics: Record<string, number>) {
  return {
    data: Object.entries(metrics).map(([name, value]) => ({ name, value })),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InstagramStatsFetcher', () => {
  let fetcher: InstagramStatsFetcher;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    // Restore pass-through after vi.restoreAllMocks wipes it
    mockRetryWithBackoff.mockImplementation((fn: () => Promise<unknown>) => fn());
    fetcher = new InstagramStatsFetcher();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // fetchChannelMetadata
  // -------------------------------------------------------------------------

  describe('fetchChannelMetadata()', () => {
    it('returns follower count and media count', async () => {
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          id: 'IG_123',
          username: 'myuser',
          name: 'My User',
          profile_picture_url: 'https://cdn.instagram.com/pic.jpg',
          followers_count: 42000,
          media_count: 150,
        }),
      );

      const meta = await fetcher.fetchChannelMetadata('ACCESS_TOKEN', 'IG_123');

      expect(meta.name).toBe('myuser');
      expect(meta.avatarUrl).toBe('https://cdn.instagram.com/pic.jpg');
      expect(meta.subscriberCount).toBe(42000n);
      expect(meta.videoCount).toBe(150);
      expect(meta.viewCount).toBeNull(); // Instagram doesn't expose total views
    });

    it('falls back to name when username is missing', async () => {
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          id: 'IG_123',
          name: 'Display Name',
          followers_count: 100,
          media_count: 10,
        }),
      );

      const meta = await fetcher.fetchChannelMetadata('TOKEN', 'IG_123');
      expect(meta.name).toBe('Display Name');
    });

    it('falls back to platformChannelId when both username and name are missing', async () => {
      global.fetch = vi
        .fn()
        .mockReturnValue(jsonResponse({ id: 'IG_123', followers_count: 0, media_count: 0 }));

      const meta = await fetcher.fetchChannelMetadata('TOKEN', 'IG_123');
      expect(meta.name).toBe('IG_123');
    });

    it('returns null for avatarUrl when profile_picture_url is missing', async () => {
      global.fetch = vi
        .fn()
        .mockReturnValue(
          jsonResponse({ id: 'IG_123', username: 'user', followers_count: 10, media_count: 5 }),
        );

      const meta = await fetcher.fetchChannelMetadata('TOKEN', 'IG_123');
      expect(meta.avatarUrl).toBeNull();
    });

    it('returns null subscriberCount when followers_count is absent', async () => {
      global.fetch = vi
        .fn()
        .mockReturnValue(jsonResponse({ id: 'IG_123', username: 'user', media_count: 5 }));

      const meta = await fetcher.fetchChannelMetadata('TOKEN', 'IG_123');
      expect(meta.subscriberCount).toBeNull();
    });

    it('throws when the API returns an error object', async () => {
      global.fetch = vi
        .fn()
        .mockReturnValue(
          jsonResponse({ error: { code: 190, message: 'Invalid OAuth access token' } }),
        );

      await expect(fetcher.fetchChannelMetadata('BAD_TOKEN', 'IG_123')).rejects.toThrow(
        'Instagram API error 190',
      );
    });

    it('includes access_token in request URL', async () => {
      const mockFetch = vi
        .fn()
        .mockReturnValue(
          jsonResponse({ id: 'IG_123', username: 'user', followers_count: 0, media_count: 0 }),
        );
      global.fetch = mockFetch;

      await fetcher.fetchChannelMetadata('MY_ACCESS_TOKEN', 'IG_123');

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('access_token=MY_ACCESS_TOKEN');
      expect(url).toContain('/IG_123?fields=');
    });
  });

  // -------------------------------------------------------------------------
  // fetchVideoList
  // -------------------------------------------------------------------------

  describe('fetchVideoList()', () => {
    it('returns Reels filtered by VIDEO media_type', async () => {
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          data: [
            buildMediaItem({ id: 'V1', media_type: 'VIDEO' }),
            buildMediaItem({ id: 'IMG1', media_type: 'IMAGE' }),
            buildMediaItem({ id: 'V2', media_type: 'VIDEO' }),
            buildMediaItem({ id: 'CAR1', media_type: 'CAROUSEL_ALBUM' }),
          ],
          paging: {},
        }),
      );

      const result = await fetcher.fetchVideoList('TOKEN', 'IG_123');
      expect(result.videos).toHaveLength(2);
      expect(result.videos.map((v) => v.platformVideoId)).toEqual(['V1', 'V2']);
    });

    it('maps caption to title and description', async () => {
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          data: [buildMediaItem({ caption: 'My Reel #travel', media_type: 'VIDEO' })],
          paging: {},
        }),
      );

      const result = await fetcher.fetchVideoList('TOKEN', 'IG_123');
      const video = result.videos[0];
      expect(video.title).toBe('My Reel #travel');
      expect(video.description).toBe('My Reel #travel');
    });

    it('truncates title to 200 characters', async () => {
      const longCaption = 'X'.repeat(300);
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          data: [buildMediaItem({ caption: longCaption, media_type: 'VIDEO' })],
          paging: {},
        }),
      );

      const result = await fetcher.fetchVideoList('TOKEN', 'IG_123');
      expect(result.videos[0].title).toHaveLength(200);
    });

    it('returns empty title when caption is missing', async () => {
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          data: [buildMediaItem({ caption: undefined, media_type: 'VIDEO' })],
          paging: {},
        }),
      );

      const result = await fetcher.fetchVideoList('TOKEN', 'IG_123');
      expect(result.videos[0].title).toBe('');
      expect(result.videos[0].description).toBeNull();
    });

    it('maps timestamp to publishedAt Date', async () => {
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          data: [buildMediaItem({ timestamp: '2024-03-10T08:00:00.000Z', media_type: 'VIDEO' })],
          paging: {},
        }),
      );

      const result = await fetcher.fetchVideoList('TOKEN', 'IG_123');
      expect(result.videos[0].publishedAt).toEqual(new Date('2024-03-10T08:00:00.000Z'));
    });

    it('returns null publishedAt when timestamp is missing', async () => {
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          data: [buildMediaItem({ timestamp: undefined, media_type: 'VIDEO' })],
          paging: {},
        }),
      );

      const result = await fetcher.fetchVideoList('TOKEN', 'IG_123');
      expect(result.videos[0].publishedAt).toBeNull();
    });

    it('includes pagination cursor in nextPageToken', async () => {
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          data: [buildMediaItem({ media_type: 'VIDEO' })],
          paging: { cursors: { after: 'CURSOR_ABC' } },
        }),
      );

      const result = await fetcher.fetchVideoList('TOKEN', 'IG_123');
      expect(result.nextPageToken).toBe('CURSOR_ABC');
    });

    it('returns undefined nextPageToken when paging cursor is absent', async () => {
      global.fetch = vi
        .fn()
        .mockReturnValue(
          jsonResponse({ data: [buildMediaItem({ media_type: 'VIDEO' })], paging: {} }),
        );

      const result = await fetcher.fetchVideoList('TOKEN', 'IG_123');
      expect(result.nextPageToken).toBeUndefined();
    });

    it('appends pageToken as "after" cursor to the request URL', async () => {
      const mockFetch = vi.fn().mockReturnValue(jsonResponse({ data: [], paging: {} }));
      global.fetch = mockFetch;

      await fetcher.fetchVideoList('TOKEN', 'IG_123', 'MY_CURSOR');

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('after=MY_CURSOR');
    });

    it('returns empty array when data field is missing', async () => {
      global.fetch = vi.fn().mockReturnValue(jsonResponse({}));

      const result = await fetcher.fetchVideoList('TOKEN', 'IG_123');
      expect(result.videos).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // fetchVideoStats
  // -------------------------------------------------------------------------

  describe('fetchVideoStats()', () => {
    it('fetches insights per video and maps plays to viewCount', async () => {
      global.fetch = vi
        .fn()
        .mockReturnValue(
          jsonResponse(
            buildInsightsResponse({ plays: 50000, likes: 2000, comments: 100, shares: 300 }),
          ),
        );

      const stats = await fetcher.fetchVideoStats('TOKEN', ['MEDIA_1']);

      expect(stats).toHaveLength(1);
      expect(stats[0].platformVideoId).toBe('MEDIA_1');
      expect(stats[0].viewCount).toBe(50000n);
      expect(stats[0].likeCount).toBe(2000n);
      expect(stats[0].commentCount).toBe(100n);
      expect(stats[0].shareCount).toBe(300n);
    });

    it('returns zeros for videos without insights (API error response)', async () => {
      global.fetch = vi
        .fn()
        .mockReturnValue(
          jsonResponse({ error: { code: 100, message: 'Insights not available yet' } }),
        );

      const stats = await fetcher.fetchVideoStats('TOKEN', ['NEW_MEDIA']);
      expect(stats[0].viewCount).toBe(0n);
      expect(stats[0].likeCount).toBe(0n);
      expect(stats[0].commentCount).toBe(0n);
      expect(stats[0].shareCount).toBe(0n);
    });

    it('handles missing metric fields with zero fallback', async () => {
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({ data: [] }), // empty metrics
      );

      const stats = await fetcher.fetchVideoStats('TOKEN', ['MEDIA_X']);
      expect(stats[0].viewCount).toBe(0n);
      expect(stats[0].likeCount).toBe(0n);
    });

    it('supports values[0].value format for lifetime metrics', async () => {
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          data: [
            { name: 'plays', values: [{ value: 12345 }] },
            { name: 'likes', values: [{ value: 500 }] },
          ],
        }),
      );

      const stats = await fetcher.fetchVideoStats('TOKEN', ['MEDIA_Y']);
      expect(stats[0].viewCount).toBe(12345n);
      expect(stats[0].likeCount).toBe(500n);
    });

    it('handles API errors per-video without failing the batch', async () => {
      global.fetch = vi
        .fn()
        .mockReturnValueOnce(
          jsonResponse(buildInsightsResponse({ plays: 1000, likes: 50, comments: 5, shares: 10 })),
        )
        .mockReturnValueOnce(jsonResponse({ error: { code: 100, message: 'Not available' } }))
        .mockReturnValueOnce(
          jsonResponse(buildInsightsResponse({ plays: 2000, likes: 80, comments: 20, shares: 5 })),
        );

      const stats = await fetcher.fetchVideoStats('TOKEN', ['M1', 'M2', 'M3']);

      expect(stats).toHaveLength(3);
      expect(stats[0].viewCount).toBe(1000n);
      expect(stats[1].viewCount).toBe(0n); // zeroed out due to error
      expect(stats[2].viewCount).toBe(2000n);
    });

    it('returns zeros when fetch throws (network error)', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));

      const stats = await fetcher.fetchVideoStats('TOKEN', ['MEDIA_ERR']);
      expect(stats[0].viewCount).toBe(0n);
      expect(stats[0].platformVideoId).toBe('MEDIA_ERR');
    });

    it('processes multiple videos sequentially', async () => {
      const mockFetch = vi
        .fn()
        .mockReturnValue(
          jsonResponse(buildInsightsResponse({ plays: 100, likes: 10, comments: 2, shares: 1 })),
        );
      global.fetch = mockFetch;

      const ids = ['M1', 'M2', 'M3'];
      const stats = await fetcher.fetchVideoStats('TOKEN', ids);

      expect(stats).toHaveLength(3);
      expect(mockFetch).toHaveBeenCalledTimes(3);
      ids.forEach((id, i) => {
        expect(stats[i].platformVideoId).toBe(id);
      });
    });

    it('adds delay between batches of 10 videos', async () => {
      // Verify that after 10 videos the fetcher inserts a delay.
      // We fake timers to avoid real waits.
      vi.useFakeTimers();

      const mockFetch = vi
        .fn()
        .mockReturnValue(
          jsonResponse(buildInsightsResponse({ plays: 0, likes: 0, comments: 0, shares: 0 })),
        );
      global.fetch = mockFetch;

      const ids = Array.from({ length: 11 }, (_, i) => `MEDIA_${i}`);

      // Run the fetcher in background; after first 10 it will hit the delay
      const statsPromise = fetcher.fetchVideoStats('TOKEN', ids);

      // Advance past the 3-second inter-batch delay
      await vi.runAllTimersAsync();

      const stats = await statsPromise;
      expect(stats).toHaveLength(11);

      vi.useRealTimers();
    });

    it('returns empty array when no video IDs provided', async () => {
      global.fetch = vi.fn();
      const stats = await fetcher.fetchVideoStats('TOKEN', []);
      expect(stats).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
