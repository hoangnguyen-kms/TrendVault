// Heuristic thresholds for YouTube Shorts detection
const SHORTS_MAX_DURATION = 180; // seconds
const VERTICAL_ASPECT_THRESHOLD = 0.7; // width/height ratio for vertical video

export interface ShortsDetectionMetadata {
  duration: number | null;
  thumbnailWidth: number | null;
  thumbnailHeight: number | null;
  title: string;
}

/**
 * Detects whether a video is a YouTube Short based on:
 * 1. Duration <= 180 seconds
 * 2. Vertical aspect ratio (width/height < 0.7)
 * 3. #shorts in title
 */
export function detectShort(metadata: ShortsDetectionMetadata): boolean {
  if (!metadata.duration || metadata.duration > SHORTS_MAX_DURATION) return false;

  if (metadata.thumbnailWidth && metadata.thumbnailHeight && metadata.thumbnailHeight > 0) {
    if (metadata.thumbnailWidth / metadata.thumbnailHeight < VERTICAL_ASPECT_THRESHOLD) return true;
  }

  if (/#shorts/i.test(metadata.title)) return true;

  return false;
}

/**
 * Computes aspect ratio (width/height) rounded to 2 decimal places.
 */
export function computeAspectRatio(width: number, height: number): number {
  if (height === 0) return 0;
  return Math.round((width / height) * 100) / 100;
}
