import { z } from 'zod';

export const PlatformSchema = z.enum(['YOUTUBE', 'TIKTOK', 'INSTAGRAM']);
export type Platform = z.infer<typeof PlatformSchema>;
