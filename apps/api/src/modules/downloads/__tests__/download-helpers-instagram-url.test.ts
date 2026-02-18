import { describe, it, expect } from 'vitest';
import { buildVideoUrl } from '../download-helpers.js';

describe('buildVideoUrl() — INSTAGRAM', () => {
  it('returns correct Reel URL for a standard shortCode', () => {
    expect(buildVideoUrl('INSTAGRAM', 'ABC123xyz')).toBe(
      'https://www.instagram.com/reel/ABC123xyz/',
    );
  });

  it('returns correct Reel URL with underscore and hyphen in shortCode', () => {
    expect(buildVideoUrl('INSTAGRAM', 'A1_B2-C3')).toBe('https://www.instagram.com/reel/A1_B2-C3/');
  });

  it('throws for shortCode with invalid characters', () => {
    expect(() => buildVideoUrl('INSTAGRAM', 'bad/code')).toThrow('Invalid platformVideoId format');
  });

  it('throws for shortCode with spaces', () => {
    expect(() => buildVideoUrl('INSTAGRAM', 'has space')).toThrow('Invalid platformVideoId format');
  });

  // Ensure INSTAGRAM case does not bleed into other platforms
  it('YOUTUBE still returns watch URL', () => {
    expect(buildVideoUrl('YOUTUBE', 'dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
  });

  it('throws for unsupported platform', () => {
    expect(() => buildVideoUrl('FACEBOOK', 'VIDEO123')).toThrow('Unsupported platform');
  });
});
