import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma-client.js';
import { env } from '../../config/environment.js';
import { parseDurationToMs } from '../../lib/duration-utils.js';
import type { LoginRequest, RegisterRequest } from '@trendvault/shared-types';

const BCRYPT_ROUNDS = 12;

export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const authService = {
  async register(data: RegisterRequest): Promise<UserWithoutPassword> {
    const email = data.email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  },

  async login(data: LoginRequest): Promise<UserWithoutPassword> {
    const email = data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async getUserById(id: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  },

  signToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  },

  // --- Refresh Token Methods ---

  /** Generate a cryptographically random refresh token string */
  generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  },

  /** Hash a refresh token for safe DB storage */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  /** Create and store a refresh token, return the raw token for the cookie */
  async createRefreshToken(userId: string): Promise<string> {
    const token = this.generateRefreshToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));

    await prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return token;
  },

  /**
   * Validate a refresh token, rotate it (delete old + create new),
   * and return the userId + new raw token.
   * Returns null if token is invalid or expired.
   */
  async rotateRefreshToken(
    oldToken: string,
  ): Promise<{ userId: string; newRefreshToken: string } | null> {
    const tokenHash = this.hashToken(oldToken);

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored) return null;

    // Delete the old token regardless (consumed or expired)
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    if (stored.expiresAt < new Date()) return null;

    // Issue a new refresh token (rotation prevents replay)
    const newRefreshToken = await this.createRefreshToken(stored.userId);
    return { userId: stored.userId, newRefreshToken };
  },

  /** Revoke all refresh tokens for a user (logout from all sessions) */
  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  },

  /** Revoke a single refresh token (logout current session only) */
  async revokeRefreshToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  },
};
