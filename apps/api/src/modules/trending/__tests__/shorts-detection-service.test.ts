import { describe, it, expect } from 'vitest';
import { detectShort, computeAspectRatio } from '../shorts-detection-service.js';

describe('ShortsDetectionService', () => {
  describe('detectShort()', () => {
    describe('Duration-based detection', () => {
      it('should return true for video with duration <= 180s and vertical aspect ratio', () => {
        const result = detectShort({
          duration: 60,
          thumbnailWidth: 400,
          thumbnailHeight: 600,
          title: 'Test Video',
        });
        expect(result).toBe(true);
      });

      it('should return true for video with duration = 180s (exact boundary)', () => {
        const result = detectShort({
          duration: 180,
          thumbnailWidth: 400,
          thumbnailHeight: 600,
          title: 'Test Video',
        });
        expect(result).toBe(true);
      });

      it('should return false for video with duration > 180s', () => {
        const result = detectShort({
          duration: 181,
          thumbnailWidth: 400,
          thumbnailHeight: 600,
          title: 'Test Video',
        });
        expect(result).toBe(false);
      });

      it('should return false for video with duration > 180s even with vertical aspect', () => {
        const result = detectShort({
          duration: 300,
          thumbnailWidth: 400,
          thumbnailHeight: 600,
          title: 'Test Video',
        });
        expect(result).toBe(false);
      });

      it('should return false when duration is null', () => {
        const result = detectShort({
          duration: null,
          thumbnailWidth: 400,
          thumbnailHeight: 600,
          title: 'Test Video',
        });
        expect(result).toBe(false);
      });

      it('should return false when duration is 0', () => {
        const result = detectShort({
          duration: 0,
          thumbnailWidth: 400,
          thumbnailHeight: 600,
          title: 'Test Video',
        });
        expect(result).toBe(false);
      });
    });

    describe('Vertical aspect ratio detection', () => {
      it('should return true for vertical video (9:16 ratio, 0.56)', () => {
        const result = detectShort({
          duration: 60,
          thumbnailWidth: 360,
          thumbnailHeight: 640,
          title: 'Vertical Video',
        });
        expect(result).toBe(true);
      });

      it('should return true for video at aspect ratio threshold (< 0.7)', () => {
        // 0.69 ratio
        const result = detectShort({
          duration: 60,
          thumbnailWidth: 414,
          thumbnailHeight: 600,
          title: 'Test Video',
        });
        expect(result).toBe(true);
      });

      it('should return false for horizontal video (16:9 ratio, 1.78)', () => {
        const result = detectShort({
          duration: 60,
          thumbnailWidth: 1280,
          thumbnailHeight: 720,
          title: 'Horizontal Video',
        });
        expect(result).toBe(false);
      });

      it('should return false for square video (1:1 ratio)', () => {
        const result = detectShort({
          duration: 60,
          thumbnailWidth: 600,
          thumbnailHeight: 600,
          title: 'Square Video',
        });
        expect(result).toBe(false);
      });

      it('should return false when thumbnail dimensions missing', () => {
        const result = detectShort({
          duration: 60,
          thumbnailWidth: null,
          thumbnailHeight: null,
          title: 'No Thumbnails',
        });
        expect(result).toBe(false);
      });

      it('should return false when only width is provided', () => {
        const result = detectShort({
          duration: 60,
          thumbnailWidth: 400,
          thumbnailHeight: null,
          title: 'Partial Dimensions',
        });
        expect(result).toBe(false);
      });

      it('should return false when only height is provided', () => {
        const result = detectShort({
          duration: 60,
          thumbnailWidth: null,
          thumbnailHeight: 600,
          title: 'Partial Dimensions',
        });
        expect(result).toBe(false);
      });
    });

    describe('#shorts hashtag detection', () => {
      it('should return true for duration <= 180s with #shorts in title', () => {
        const result = detectShort({
          duration: 120,
          thumbnailWidth: null,
          thumbnailHeight: null,
          title: 'Check this #shorts video',
        });
        expect(result).toBe(true);
      });

      it('should return true for #Shorts (uppercase)', () => {
        const result = detectShort({
          duration: 120,
          thumbnailWidth: null,
          thumbnailHeight: null,
          title: 'My Video #Shorts',
        });
        expect(result).toBe(true);
      });

      it('should return true for #SHORTS (all caps)', () => {
        const result = detectShort({
          duration: 120,
          thumbnailWidth: null,
          thumbnailHeight: null,
          title: 'Video #SHORTS',
        });
        expect(result).toBe(true);
      });

      it('should return false for #shorts in title but duration > 180s', () => {
        const result = detectShort({
          duration: 200,
          thumbnailWidth: null,
          thumbnailHeight: null,
          title: 'Long video #shorts',
        });
        expect(result).toBe(false);
      });

      it('should return false when #shorts not in title', () => {
        const result = detectShort({
          duration: 120,
          thumbnailWidth: null,
          thumbnailHeight: null,
          title: 'Just a regular video',
        });
        expect(result).toBe(false);
      });

      it('should handle #shorts at different positions in title', () => {
        expect(
          detectShort({
            duration: 120,
            thumbnailWidth: null,
            thumbnailHeight: null,
            title: '#shorts Amazing Video',
          }),
        ).toBe(true);

        expect(
          detectShort({
            duration: 120,
            thumbnailWidth: null,
            thumbnailHeight: null,
            title: 'Amazing Video #shorts Here',
          }),
        ).toBe(true);

        expect(
          detectShort({
            duration: 120,
            thumbnailWidth: null,
            thumbnailHeight: null,
            title: 'Amazing Video #shorts',
          }),
        ).toBe(true);
      });
    });

    describe('Combined criteria', () => {
      it('should return true when ANY criterion is met (vertical aspect OR #shorts)', () => {
        // Vertical aspect without hashtag
        expect(
          detectShort({
            duration: 60,
            thumbnailWidth: 400,
            thumbnailHeight: 600,
            title: 'Video without hashtag',
          }),
        ).toBe(true);

        // #shorts without vertical aspect
        expect(
          detectShort({
            duration: 60,
            thumbnailWidth: 1280,
            thumbnailHeight: 720,
            title: 'Video with #shorts',
          }),
        ).toBe(true);

        // Both criteria
        expect(
          detectShort({
            duration: 60,
            thumbnailWidth: 400,
            thumbnailHeight: 600,
            title: 'Video with #shorts',
          }),
        ).toBe(true);
      });

      it('should return false when no criteria are met', () => {
        const result = detectShort({
          duration: 60,
          thumbnailWidth: 1280,
          thumbnailHeight: 720,
          title: 'Regular horizontal video',
        });
        expect(result).toBe(false);
      });
    });
  });

  describe('computeAspectRatio()', () => {
    it('should compute aspect ratio for 16:9 video', () => {
      const ratio = computeAspectRatio(1280, 720);
      expect(ratio).toBe(1.78);
    });

    it('should compute aspect ratio for 9:16 video', () => {
      const ratio = computeAspectRatio(360, 640);
      expect(ratio).toBe(0.56);
    });

    it('should compute aspect ratio for square video (1:1)', () => {
      const ratio = computeAspectRatio(600, 600);
      expect(ratio).toBe(1.0);
    });

    it('should round to 2 decimal places', () => {
      const ratio = computeAspectRatio(400, 600);
      // 400/600 = 0.666... → rounded to 0.67
      expect(ratio).toBe(0.67);
    });

    it('should handle 4:3 aspect ratio', () => {
      const ratio = computeAspectRatio(800, 600);
      expect(ratio).toBe(1.33);
    });

    it('should handle 3:2 aspect ratio', () => {
      const ratio = computeAspectRatio(900, 600);
      expect(ratio).toBe(1.5);
    });

    it('should return 0 when height is 0', () => {
      const ratio = computeAspectRatio(1280, 0);
      expect(ratio).toBe(0);
    });

    it('should handle very small dimensions', () => {
      const ratio = computeAspectRatio(9, 16);
      expect(ratio).toBe(0.56);
    });

    it('should handle large dimensions', () => {
      const ratio = computeAspectRatio(3840, 2160);
      expect(ratio).toBe(1.78);
    });

    it('should return correct ratio for 1px height', () => {
      const ratio = computeAspectRatio(100, 1);
      expect(ratio).toBe(100.0);
    });
  });
});
