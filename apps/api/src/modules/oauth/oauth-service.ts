import { prisma } from '../../lib/prisma-client.js';
import { encryptionService } from '../../services/encryption/encryption-service.js';
import { env } from '../../config/environment.js';
import type { Platform } from '@prisma/client';

interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
}

interface PlatformProfile {
  platformUserId: string;
  displayName: string;
  avatarUrl?: string;
}

/** Token blob stored as a single encrypted payload (access + refresh) */
interface TokenBlob {
  accessToken: string;
  refreshToken: string | null;
}

export class OAuthService {
  /** Store encrypted OAuth tokens and upsert connected account */
  async connectAccount(userId: string, platform: Platform, tokens: OAuthTokens, profile: PlatformProfile) {
    // Encrypt both tokens as a single blob — single IV/authTag covers both
    const blob: TokenBlob = { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken ?? null };
    const encrypted = await encryptionService.encrypt(JSON.stringify(blob), userId);

    const account = await prisma.connectedAccount.upsert({
      where: {
        userId_platform_platformUserId: {
          userId,
          platform,
          platformUserId: profile.platformUserId,
        },
      },
      update: {
        accessTokenEncrypted: encrypted.encrypted,
        tokenIv: encrypted.iv,
        tokenAuthTag: encrypted.authTag,
        refreshTokenEncrypted: null, // unused — both tokens in blob
        tokenExpiresAt: tokens.expiresAt ?? null,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl ?? null,
        scopes: tokens.scopes,
      },
      create: {
        userId,
        platform,
        platformUserId: profile.platformUserId,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl ?? null,
        accessTokenEncrypted: encrypted.encrypted,
        tokenIv: encrypted.iv,
        tokenAuthTag: encrypted.authTag,
        refreshTokenEncrypted: null,
        tokenExpiresAt: tokens.expiresAt ?? null,
        scopes: tokens.scopes,
      },
    });

    // Discover channels after connecting
    await this.discoverChannels(userId, account.id, platform, tokens.accessToken);

    return account;
  }

  /** Decrypt token blob and return access token, refreshing if expired */
  async getDecryptedToken(accountId: string, userId: string): Promise<string> {
    const account = await prisma.connectedAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) throw new Error('Connected account not found');

    // Refresh if expired
    if (account.tokenExpiresAt && account.tokenExpiresAt < new Date()) {
      return this.refreshAndDecrypt(account, userId);
    }

    const blob = await this.decryptTokenBlob(account, userId);
    return blob.accessToken;
  }

  /** Disconnect account — revoke tokens and delete record */
  async disconnectAccount(accountId: string, userId: string): Promise<void> {
    const account = await prisma.connectedAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) throw new Error('Connected account not found');

    // Best-effort token revocation
    try {
      const blob = await this.decryptTokenBlob(account, userId);
      await this.revokeToken(account.platform, blob.accessToken);
    } catch {
      // Continue with deletion even if revocation fails
    }

    await prisma.connectedAccount.delete({ where: { id: accountId } });
  }

  /** Decrypt the encrypted token blob into its components */
  private async decryptTokenBlob(
    account: { accessTokenEncrypted: Uint8Array<ArrayBuffer>; tokenIv: Uint8Array<ArrayBuffer>; tokenAuthTag: Uint8Array<ArrayBuffer> },
    userId: string,
  ): Promise<TokenBlob> {
    const raw = await encryptionService.decrypt(
      account.accessTokenEncrypted,
      account.tokenIv,
      account.tokenAuthTag,
      userId,
    );
    return JSON.parse(raw) as TokenBlob;
  }

  /** Refresh expired token, re-encrypt blob, and return decrypted access token */
  private async refreshAndDecrypt(
    account: { id: string; platform: Platform; accessTokenEncrypted: Uint8Array<ArrayBuffer>; tokenIv: Uint8Array<ArrayBuffer>; tokenAuthTag: Uint8Array<ArrayBuffer> },
    userId: string,
  ): Promise<string> {
    const blob = await this.decryptTokenBlob(account, userId);
    if (!blob.refreshToken) {
      throw new Error('No refresh token available — please reconnect');
    }

    let newAccessToken: string;
    let newExpiresAt: Date;

    if (account.platform === 'YOUTUBE') {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.GOOGLE_CLIENT_ID!,
          client_secret: env.GOOGLE_CLIENT_SECRET!,
          refresh_token: blob.refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      const data = await res.json() as { access_token: string; expires_in: number };
      if (!data.access_token) throw new Error('Google token refresh failed');
      newAccessToken = data.access_token;
      newExpiresAt = new Date(Date.now() + data.expires_in * 1000);
    } else {
      const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: env.TIKTOK_CLIENT_KEY!,
          client_secret: env.TIKTOK_CLIENT_SECRET!,
          refresh_token: blob.refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      const data = await res.json() as { access_token: string; expires_in: number };
      if (!data.access_token) throw new Error('TikTok token refresh failed');
      newAccessToken = data.access_token;
      newExpiresAt = new Date(Date.now() + data.expires_in * 1000);
    }

    // Re-encrypt blob with new access token (keep existing refresh token)
    const newBlob: TokenBlob = { accessToken: newAccessToken, refreshToken: blob.refreshToken };
    const newData = await encryptionService.encrypt(JSON.stringify(newBlob), userId);
    await prisma.connectedAccount.update({
      where: { id: account.id },
      data: {
        accessTokenEncrypted: newData.encrypted,
        tokenIv: newData.iv,
        tokenAuthTag: newData.authTag,
        tokenExpiresAt: newExpiresAt,
      },
    });

    return newAccessToken;
  }

  /** Discover channels for the connected platform account */
  private async discoverChannels(
    userId: string,
    accountId: string,
    platform: Platform,
    accessToken: string,
  ): Promise<void> {
    try {
      if (platform === 'YOUTUBE') {
        await this.discoverYouTubeChannels(accountId, accessToken);
      } else {
        await this.discoverTikTokProfile(accountId, accessToken);
      }
    } catch (err) {
      console.error(`[oauth] Channel discovery failed for ${platform}:`, err);
    }
  }

  private async discoverYouTubeChannels(accountId: string, accessToken: string): Promise<void> {
    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const data = await res.json() as {
      items?: Array<{
        id: string;
        snippet: { title: string; thumbnails?: { default?: { url: string } }; country?: string };
        statistics: { subscriberCount?: string; viewCount?: string; videoCount?: string };
      }>;
    };

    for (const ch of data.items ?? []) {
      await prisma.channel.upsert({
        where: { connectedAccountId_platformChannelId: { connectedAccountId: accountId, platformChannelId: ch.id } },
        update: {
          name: ch.snippet.title,
          avatarUrl: ch.snippet.thumbnails?.default?.url ?? null,
          region: ch.snippet.country ?? null,
          subscriberCount: ch.statistics.subscriberCount ? BigInt(ch.statistics.subscriberCount) : null,
          totalViews: ch.statistics.viewCount ? BigInt(ch.statistics.viewCount) : null,
          videoCount: ch.statistics.videoCount ? Number(ch.statistics.videoCount) : null,
          lastSyncedAt: new Date(),
        },
        create: {
          connectedAccountId: accountId,
          platform: 'YOUTUBE',
          platformChannelId: ch.id,
          name: ch.snippet.title,
          avatarUrl: ch.snippet.thumbnails?.default?.url ?? null,
          region: ch.snippet.country ?? null,
          subscriberCount: ch.statistics.subscriberCount ? BigInt(ch.statistics.subscriberCount) : null,
          totalViews: ch.statistics.viewCount ? BigInt(ch.statistics.viewCount) : null,
          videoCount: ch.statistics.videoCount ? Number(ch.statistics.videoCount) : null,
          lastSyncedAt: new Date(),
        },
      });
    }
  }

  private async discoverTikTokProfile(accountId: string, accessToken: string): Promise<void> {
    const res = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const data = await res.json() as {
      data?: { user?: { open_id: string; display_name: string; avatar_url?: string } };
    };

    const user = data.data?.user;
    if (!user) return;

    await prisma.channel.upsert({
      where: { connectedAccountId_platformChannelId: { connectedAccountId: accountId, platformChannelId: user.open_id } },
      update: {
        name: user.display_name,
        avatarUrl: user.avatar_url ?? null,
        lastSyncedAt: new Date(),
      },
      create: {
        connectedAccountId: accountId,
        platform: 'TIKTOK',
        platformChannelId: user.open_id,
        name: user.display_name,
        avatarUrl: user.avatar_url ?? null,
        lastSyncedAt: new Date(),
      },
    });
  }

  /** Best-effort token revocation — H4 fix: token in POST body, not URL */
  private async revokeToken(platform: Platform, token: string): Promise<void> {
    if (platform === 'YOUTUBE') {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token }),
      });
    } else {
      await fetch('https://open.tiktokapis.com/v2/oauth/revoke/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: env.TIKTOK_CLIENT_KEY!,
          token,
        }),
      });
    }
  }
}

export const oauthService = new OAuthService();
