import { CorsOptions } from 'cors';
import { env } from './environment.js';

export const corsOptions: CorsOptions = {
  origin: env.CORS_ORIGIN,
  credentials: true,
};
