import type { HelmetOptions } from 'helmet';
import { env } from './environment.js';

/**
 * Helmet security configuration with Content Security Policy (CSP)
 *
 * CSP directives:
 * - default-src: Default policy for loading content
 * - script-src: Allowed sources for JavaScript
 * - style-src: Allowed sources for stylesheets
 * - img-src: Allowed sources for images
 * - connect-src: Allowed sources for fetch, XHR, WebSocket
 * - font-src: Allowed sources for fonts
 * - object-src: Allowed sources for plugins
 * - media-src: Allowed sources for audio/video
 * - frame-src: Allowed sources for nested contexts
 */
export const helmetConfig: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        // Allow inline scripts for Vite HMR in development
        ...(env.NODE_ENV === 'development' ? ["'unsafe-inline'"] : []),
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for dynamic styling
      ],
      imgSrc: [
        "'self'",
        'data:', // Allow data URIs for inline images
        'https:', // Allow HTTPS images from external sources
      ],
      connectSrc: [
        "'self'",
        // Allow WebSocket connections for Socket.IO
        ...(env.NODE_ENV === 'development' ? ['ws:', 'wss:'] : ['wss:']),
      ],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some third-party integrations
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Required for CORS
};
