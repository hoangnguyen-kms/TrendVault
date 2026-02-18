import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks — must be declared before any import (vitest hoists vi.mock)
// ---------------------------------------------------------------------------

vi.mock('../../../lib/prisma-client.js', () => ({
  prisma: {
    connectedAccount: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    channel: {
      upsert: vi.fn(),
    },
  },
  Platform: {
    INSTAGRAM: 'INSTAGRAM',
    YOUTUBE: 'YOUTUBE',
    TIKTOK: 'TIKTOK',
  },
}));

// Declare mocks at module scope so they survive vi.clearAllMocks() resets
// and can be re-configured in beforeEach.
const mockEncrypt = vi.fn();
const mockDecrypt = vi.fn();

vi.mock('../../../services/encryption/encryption-service.js', () => ({
  // Use getters so the module object always delegates to the current fn reference
  encryptionService: {
    get encrypt() {
      return mockEncrypt;
    },
    get decrypt() {
      return mockDecrypt;
    },
  },
}));

vi.mock('../../../config/environment.js', () => ({
  env: {
    GOOGLE_CLIENT_ID: 'GOOGLE_ID',
    GOOGLE_CLIENT_SECRET: 'GOOGLE_SECRET',
    TIKTOK_CLIENT_KEY: 'TT_KEY',
    TIKTOK_CLIENT_SECRET: 'TT_SECRET',
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are hoisted)
// ---------------------------------------------------------------------------

import { OAuthService } from '../oauth-service.js';
import { prisma } from '../../../lib/prisma-client.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(body),
  });
}

/** Build a fake ConnectedAccount row as Prisma would return it */
function buildAccount(overrides?: Record<string, unknown>) {
  return {
    id: 'ACCOUNT_1',
    userId: 'USER_1',
    platform: 'INSTAGRAM' as const,
    platformUserId: 'IG_USER_1',
    displayName: 'Test User',
    avatarUrl: null,
    accessTokenEncrypted: Buffer.from('enc'),
    tokenIv: Buffer.from('iv'),
    tokenAuthTag: Buffer.from('tag'),
    refreshTokenEncrypted: null,
    tokenExpiresAt: null,
    scopes: ['instagram_basic', 'instagram_content_publish'],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OAuthService — Instagram', () => {
  let service: OAuthService;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    service = new OAuthService();
    originalFetch = global.fetch;
    vi.clearAllMocks();
    // Re-set default mock implementations after clearAllMocks() wipes them
    mockEncrypt.mockResolvedValue({
      encrypted: Buffer.from('enc'),
      iv: Buffer.from('iv'),
      authTag: Buffer.from('tag'),
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // -------------------------------------------------------------------------
  // Token refresh — Instagram uses long-lived tokens refreshed via the
  // existing access token (no refresh_token required).
  // -------------------------------------------------------------------------

  describe('Instagram token refresh (long-lived token)', () => {
    it('refreshes token via ig_refresh_token grant using the existing access token', async () => {
      const expiredAccount = buildAccount({
        tokenExpiresAt: new Date(Date.now() - 1000), // expired 1 s ago
      });
      vi.mocked(prisma.connectedAccount.findFirst).mockResolvedValue(expiredAccount as never);
      mockDecrypt.mockResolvedValue(
        JSON.stringify({ accessToken: 'OLD_ACCESS_TOKEN', refreshToken: null }),
      );

      const mockFetch = vi
        .fn()
        .mockReturnValue(
          jsonResponse({
            access_token: 'NEW_ACCESS_TOKEN',
            token_type: 'bearer',
            expires_in: 5184000,
          }),
        );
      global.fetch = mockFetch;
      vi.mocked(prisma.connectedAccount.update).mockResolvedValue(expiredAccount as never);

      const token = await service.getDecryptedToken('ACCOUNT_1', 'USER_1');

      expect(token).toBe('NEW_ACCESS_TOKEN');
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('graph.instagram.com/refresh_access_token');
      expect(url).toContain('grant_type=ig_refresh_token');
      expect(url).toContain('access_token=');
    });

    it('re-encrypts the refreshed token blob and updates the account', async () => {
      const expiredAccount = buildAccount({
        tokenExpiresAt: new Date(Date.now() - 1000),
      });
      vi.mocked(prisma.connectedAccount.findFirst).mockResolvedValue(expiredAccount as never);
      mockDecrypt.mockResolvedValue(
        JSON.stringify({ accessToken: 'OLD_TOKEN', refreshToken: null }),
      );
      global.fetch = vi
        .fn()
        .mockReturnValue(jsonResponse({ access_token: 'REFRESHED_TOKEN', expires_in: 5184000 }));
      vi.mocked(prisma.connectedAccount.update).mockResolvedValue(expiredAccount as never);

      await service.getDecryptedToken('ACCOUNT_1', 'USER_1');

      // encrypt should be called with new token blob
      expect(mockEncrypt).toHaveBeenCalledWith(
        expect.stringContaining('REFRESHED_TOKEN'),
        'USER_1',
      );
      // prisma update should persist the new encrypted token
      expect(prisma.connectedAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ACCOUNT_1' },
          data: expect.objectContaining({ tokenExpiresAt: expect.any(Date) }),
        }),
      );
    });

    it('throws when Instagram refresh endpoint returns no access_token', async () => {
      const expiredAccount = buildAccount({
        tokenExpiresAt: new Date(Date.now() - 1000),
      });
      vi.mocked(prisma.connectedAccount.findFirst).mockResolvedValue(expiredAccount as never);
      mockDecrypt.mockResolvedValue(
        JSON.stringify({ accessToken: 'OLD_TOKEN', refreshToken: null }),
      );
      global.fetch = vi.fn().mockReturnValue(jsonResponse({})); // no access_token field

      await expect(service.getDecryptedToken('ACCOUNT_1', 'USER_1')).rejects.toThrow(
        'Instagram token refresh failed',
      );
    });

    it('applies 60-day default expiry when expires_in is absent', async () => {
      const expiredAccount = buildAccount({
        tokenExpiresAt: new Date(Date.now() - 1000),
      });
      vi.mocked(prisma.connectedAccount.findFirst).mockResolvedValue(expiredAccount as never);
      mockDecrypt.mockResolvedValue(JSON.stringify({ accessToken: 'OLD', refreshToken: null }));
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({ access_token: 'NEW_TOKEN' }), // no expires_in
      );
      vi.mocked(prisma.connectedAccount.update).mockResolvedValue(expiredAccount as never);

      await service.getDecryptedToken('ACCOUNT_1', 'USER_1');

      const updateCall = vi.mocked(prisma.connectedAccount.update).mock.calls[0][0] as {
        data: { tokenExpiresAt: Date };
      };
      // Default is 5184000 s (~60 days) — expiry must be well in the future
      const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
      expect(updateCall.data.tokenExpiresAt.getTime()).toBeGreaterThan(
        Date.now() + sixtyDaysMs - 10_000,
      );
    });
  });

  // -------------------------------------------------------------------------
  // Token revocation
  // -------------------------------------------------------------------------

  describe('Instagram token revocation', () => {
    it('calls DELETE /me/permissions to revoke all app permissions', async () => {
      const account = buildAccount();
      vi.mocked(prisma.connectedAccount.findFirst).mockResolvedValue(account as never);
      mockDecrypt.mockResolvedValue(
        JSON.stringify({ accessToken: 'ACCESS_TOKEN', refreshToken: null }),
      );
      const mockFetch = vi.fn().mockReturnValue(jsonResponse({ success: true }));
      global.fetch = mockFetch;
      vi.mocked(prisma.connectedAccount.delete).mockResolvedValue(account as never);

      await service.disconnectAccount('ACCOUNT_1', 'USER_1');

      const revokeCall = mockFetch.mock.calls.find((c) =>
        (c[0] as string).includes('me/permissions'),
      );
      expect(revokeCall).toBeDefined();
      expect(revokeCall![0]).toContain('graph.instagram.com/me/permissions');
      expect(revokeCall![1]?.method).toBe('DELETE');
    });

    it('still deletes the account record even if revocation fetch fails', async () => {
      const account = buildAccount();
      vi.mocked(prisma.connectedAccount.findFirst).mockResolvedValue(account as never);
      mockDecrypt.mockResolvedValue(JSON.stringify({ accessToken: 'TOKEN', refreshToken: null }));
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.mocked(prisma.connectedAccount.delete).mockResolvedValue(account as never);

      await expect(service.disconnectAccount('ACCOUNT_1', 'USER_1')).resolves.toBeUndefined();
      expect(prisma.connectedAccount.delete).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Channel discovery
  // -------------------------------------------------------------------------

  describe('Instagram channel discovery', () => {
    it('creates a Channel record with IG profile data on connectAccount()', async () => {
      const account = buildAccount();
      vi.mocked(prisma.connectedAccount.upsert).mockResolvedValue(account as never);
      vi.mocked(prisma.channel.upsert).mockResolvedValue({} as never);
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          id: 'IG_USER_1',
          username: 'testuser',
          name: 'Test User',
          profile_picture_url: 'https://cdn.ig.com/pic.jpg',
          followers_count: 1000,
          media_count: 50,
        }),
      );

      await service.connectAccount(
        'USER_1',
        'INSTAGRAM' as never,
        { accessToken: 'TOKEN', scopes: ['basic'] },
        { platformUserId: 'IG_USER_1', displayName: 'Test User' },
      );

      expect(prisma.channel.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            platform: 'INSTAGRAM',
            platformChannelId: 'IG_USER_1',
            name: 'Test User',
            avatarUrl: 'https://cdn.ig.com/pic.jpg',
            subscriberCount: 1000n,
            videoCount: 50,
          }),
        }),
      );
    });

    it('uses username as channel name when name is absent', async () => {
      const account = buildAccount();
      vi.mocked(prisma.connectedAccount.upsert).mockResolvedValue(account as never);
      vi.mocked(prisma.channel.upsert).mockResolvedValue({} as never);
      global.fetch = vi.fn().mockReturnValue(
        jsonResponse({
          id: 'IG_USER_1',
          username: 'myusername',
          followers_count: 500,
          media_count: 20,
        }),
      );

      await service.connectAccount(
        'USER_1',
        'INSTAGRAM' as never,
        { accessToken: 'TOKEN', scopes: [] },
        { platformUserId: 'IG_USER_1', displayName: 'My Username' },
      );

      expect(prisma.channel.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ name: 'myusername' }),
        }),
      );
    });

    it('skips channel upsert when discovery response contains no id', async () => {
      const account = buildAccount();
      vi.mocked(prisma.connectedAccount.upsert).mockResolvedValue(account as never);
      global.fetch = vi.fn().mockReturnValue(jsonResponse({})); // no id field

      await service.connectAccount(
        'USER_1',
        'INSTAGRAM' as never,
        { accessToken: 'TOKEN', scopes: [] },
        { platformUserId: 'IG_USER_1', displayName: 'User' },
      );

      expect(prisma.channel.upsert).not.toHaveBeenCalled();
    });

    it('does not throw when channel discovery fails (best-effort silenced)', async () => {
      const account = buildAccount();
      vi.mocked(prisma.connectedAccount.upsert).mockResolvedValue(account as never);
      global.fetch = vi.fn().mockRejectedValue(new Error('Discovery failed'));

      await expect(
        service.connectAccount(
          'USER_1',
          'INSTAGRAM' as never,
          { accessToken: 'TOKEN', scopes: [] },
          { platformUserId: 'IG_USER_1', displayName: 'User' },
        ),
      ).resolves.toBeDefined();
    });
  });
});
