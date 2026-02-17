import youtubedl from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/environment.js';
import { detectShort, computeAspectRatio } from '../trending/shorts-detection-service.js';

export interface DownloadOptions {
  url: string;
  format?: string;
  outputDir?: string;
  onProgress?: (progress: DownloadProgress) => void;
}

export interface DownloadProgress {
  percent: number;
  totalSize: string;
  speed: string;
  eta: string;
}

export interface DownloadResult {
  filePath: string;
  fileSize: number;
  mimeType: string;
  duration: number | null;
  resolution: string | null;
  title: string;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  isShort: boolean;
}

const DOWNLOAD_DIR = path.resolve(env.DOWNLOAD_DIR);

/** Wraps youtube-dl-exec for video downloading with progress parsing */
export class YtdlpService {
  constructor() {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
      fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }
  }

  async download(options: DownloadOptions): Promise<DownloadResult> {
    const { url, format = 'bestvideo+bestaudio/best', onProgress } = options;
    const outputDir = options.outputDir ?? DOWNLOAD_DIR;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputTemplate = path.join(outputDir, '%(id)s.%(ext)s');

    // Get metadata first
    const metadata = await this.getVideoInfo(url);
    const videoId = metadata.id as string;

    // Download using subprocess for stderr progress tracking
    const subprocess = youtubedl.exec(url, {
      format,
      mergeOutputFormat: 'mp4',
      output: outputTemplate,
      noPlaylist: true,
      restrictFilenames: true,
      newline: true,
    });

    // Parse stderr for progress updates (line-buffered to handle partial chunks)
    if (subprocess.stderr && onProgress) {
      let stderrBuffer = '';
      subprocess.stderr.on('data', (chunk: Buffer) => {
        stderrBuffer += chunk.toString();
        const lines = stderrBuffer.split(/\r?\n|\r/);
        stderrBuffer = lines.pop() ?? '';
        for (const line of lines) {
          const progress = this.parseProgress(line);
          if (progress) onProgress(progress);
        }
      });
    }

    await subprocess;

    // Find actual output file (extension may differ from metadata due to format merging)
    const actualPath = this.findDownloadedFile(outputDir, videoId);
    if (!actualPath) {
      throw new Error(`Download completed but output file not found for video ${videoId}`);
    }

    const ext = path.extname(actualPath).slice(1);
    const stats = fs.statSync(actualPath);

    const width = (metadata.width as number | undefined) ?? null;
    const height = (metadata.height as number | undefined) ?? null;
    const aspectRatio = width && height ? computeAspectRatio(width, height) : null;
    const isShort = detectShort({
      duration: (metadata.duration as number | undefined) ?? null,
      thumbnailWidth: width,
      thumbnailHeight: height,
      title: (metadata.title as string | undefined) ?? '',
    });

    return {
      filePath: actualPath,
      fileSize: stats.size,
      mimeType: `video/${ext}`,
      duration: (metadata.duration as number) ?? null,
      resolution: (metadata.resolution as string) ?? null,
      title: (metadata.title as string) ?? 'Untitled',
      width,
      height,
      aspectRatio,
      isShort,
    };
  }

  async getVideoInfo(url: string): Promise<Record<string, unknown>> {
    // Use exec + parse stdout to avoid CJS/ESM callable type issues
    const subprocess = youtubedl.exec(url, {
      dumpSingleJson: true,
      skipDownload: true,
      noPlaylist: true,
    });

    let stdout = '';
    if (subprocess.stdout) {
      subprocess.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });
    }

    await subprocess;
    return JSON.parse(stdout);
  }

  /** Find the actual downloaded file by video ID (handles extension mismatches) */
  private findDownloadedFile(dir: string, videoId: string): string | null {
    const prefix = videoId + '.';
    const files = fs.readdirSync(dir).filter((f) => f.startsWith(prefix) && !f.endsWith('.part'));
    if (files.length === 0) return null;
    return path.join(dir, files[0]);
  }

  /**
   * Parse yt-dlp progress lines. Handles modern formats:
   *   [download]  45.2% of ~  50.00MiB at    5.00MiB/s ETA 00:05
   *   [download]   0.0% of  100.00MiB at  Unknown B/s ETA Unknown
   */
  private parseProgress(line: string): DownloadProgress | null {
    const match = line.match(
      /\[download\]\s+([\d.]+)%\s+of\s+~?\s*([\d.]+\s*\w+)\s+at\s+(.+?)\s+ETA\s+(\S+)/,
    );
    if (!match) return null;
    return {
      percent: parseFloat(match[1]),
      totalSize: match[2].replace(/\s+/g, ''),
      speed: match[3].trim(),
      eta: match[4],
    };
  }
}
