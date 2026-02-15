import { z } from 'zod';
import { PlatformSchema } from './platform.js';

export const ConnectedAccountSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  platform: PlatformSchema,
  platformUserId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().url().nullable(),
  scopes: z.array(z.string()),
  tokenExpiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ConnectedAccount = z.infer<typeof ConnectedAccountSchema>;
