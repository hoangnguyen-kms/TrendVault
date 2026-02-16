import crypto from 'crypto';
import { env } from '../../config/environment.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100_000;
const KEY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface EncryptedData {
  encrypted: Uint8Array<ArrayBuffer>;
  iv: Uint8Array<ArrayBuffer>;
  authTag: Uint8Array<ArrayBuffer>;
}

class EncryptionService {
  private masterKey: Buffer;
  private keyCache = new Map<string, { key: Buffer; expiresAt: number }>();

  constructor() {
    this.masterKey = Buffer.from(env.ENCRYPTION_MASTER_KEY, 'hex');
    if (this.masterKey.length < KEY_LENGTH) {
      throw new Error('ENCRYPTION_MASTER_KEY must be at least 32 bytes (64 hex chars)');
    }
  }

  /** Derive per-user key from master key using async PBKDF2, with caching */
  private async deriveKey(userId: string): Promise<Buffer> {
    const cached = this.keyCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) return cached.key;

    const key = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(
        this.masterKey,
        userId,
        PBKDF2_ITERATIONS,
        KEY_LENGTH,
        'sha256',
        (err, derivedKey) => (err ? reject(err) : resolve(derivedKey)),
      );
    });
    this.keyCache.set(userId, { key, expiresAt: Date.now() + KEY_CACHE_TTL_MS });
    return key;
  }

  /** Encrypt a plaintext string for a specific user */
  async encrypt(plaintext: string, userId: string): Promise<EncryptedData> {
    const key = await this.deriveKey(userId);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
      encrypted: new Uint8Array(
        encrypted.buffer,
        encrypted.byteOffset,
        encrypted.byteLength,
      ) as Uint8Array<ArrayBuffer>,
      iv: new Uint8Array(iv.buffer, iv.byteOffset, iv.byteLength) as Uint8Array<ArrayBuffer>,
      authTag: new Uint8Array(
        authTag.buffer,
        authTag.byteOffset,
        authTag.byteLength,
      ) as Uint8Array<ArrayBuffer>,
    };
  }

  /** Decrypt ciphertext for a specific user */
  async decrypt(
    encrypted: Uint8Array<ArrayBuffer>,
    iv: Uint8Array<ArrayBuffer>,
    authTag: Uint8Array<ArrayBuffer>,
    userId: string,
  ): Promise<string> {
    const key = await this.deriveKey(userId);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv));
    decipher.setAuthTag(Buffer.from(authTag));
    return Buffer.concat([decipher.update(Buffer.from(encrypted)), decipher.final()]).toString(
      'utf8',
    );
  }
}

export const encryptionService = new EncryptionService();
