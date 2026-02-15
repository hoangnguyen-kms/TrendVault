import { z } from 'zod';
import { PlatformSchema } from './platform.js';

export const ChannelSchema = z.object({
  id: z.string().uuid(),
  connectedAccountId: z.string().uuid(),
  platform: PlatformSchema,
  platformChannelId: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  region: z.string().nullable(),
  subscriberCount: z.number().nullable(),
  totalViews: z.number().nullable(),
  videoCount: z.number().int().nullable(),
  isActive: z.boolean(),
  lastSyncedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Channel = z.infer<typeof ChannelSchema>;
