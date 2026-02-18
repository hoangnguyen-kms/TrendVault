import { TrendingService } from './trending-service.js';
import { YouTubeAdapter } from './adapters/youtube-adapter.js';
import { TikTokAdapter } from './adapters/tiktok-adapter.js';
import { InstagramAdapter } from './adapters/instagram-adapter.js';

// Singleton service with all platform adapters registered
export const trendingService = new TrendingService([
  new YouTubeAdapter(),
  new TikTokAdapter(),
  new InstagramAdapter(),
]);
