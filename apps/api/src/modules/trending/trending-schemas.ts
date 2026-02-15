import { TrendingQuerySchema, SUPPORTED_REGION_CODES } from '@trendvault/shared-types';
import { z } from 'zod';

// Refine region to only allow supported codes
export const GetTrendingQuerySchema = TrendingQuerySchema.extend({
  region: z
    .string()
    .toUpperCase()
    .refine((v): v is string => (SUPPORTED_REGION_CODES as readonly string[]).includes(v), {
      message: `Region must be one of: ${SUPPORTED_REGION_CODES.join(', ')}`,
    })
    .default('US'),
});

export const GetTrendingByIdParamsSchema = z.object({
  id: z.string().uuid(),
});
