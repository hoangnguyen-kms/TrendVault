import youtubedl from 'youtube-dl-exec';
import path from 'path';
import os from 'os';
import fs from 'fs';

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
}

const DOWNLOAD_DIR = path.join(os.tmpdir(), 'trendvault-downloads');

/** Wraps youtube-dl-exec for video downloading with progress parsing */
export class YtdlpService {
  constructor() {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
      fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }
  }

  async download(options: DownloadOptions): Promise<DownloadResult> {
    const { url, format = 'best', onProgress } = options;
    const outputDir = options.outputDir ?? DOWNLOAD_DIR;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputTemplate = path.join(outputDir, '%(id)s.%(ext)s');

    // Get metadata first
    const metadata = await this.getVideoInfo(url);
    const videoId = metadata.id as string;
    const ext = metadata.ext as string;
    const expectedPath = path.join(outputDir, `${videoId}.${ext}`);

    // Download using subprocess for stderr progress tracking
    const subprocess = youtubedl.exec(url, {
      format,
      output: outputTemplate,
      noPlaylist: true,
      restrictFilenames: true,
      newline: true,
    });

    // Parse stderr for progress updates
    if (subprocess.stderr && onProgress) {
      subprocess.stderr.on('data', (chunk: Buffer) => {
        const line = chunk.toString();
        const progress = this.parseProgress(line);
        if (progress) onProgress(progress);
      });
    }

    await subprocess;

    const stats = fs.statSync(expectedPath);
    return {
      filePath: expectedPath,
      fileSize: stats.size,
      mimeType: `video/${ext}`,
      duration: (metadata.duration as number) ?? null,
      resolution: (metadata.resolution as string) ?? null,
      title: (metadata.title as string) ?? 'Untitled',
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

  /** Parse yt-dlp progress: [download]  45.2% of ~50.00MiB at 5.00MiB/s ETA 00:05 */
  private parseProgress(line: string): DownloadProgress | null {
    const match = line.match(
      /\[download\]\s+([\d.]+)%\s+of\s+~?([\d.]+\w+)\s+at\s+([\d.]+\w+\/s)\s+ETA\s+(\S+)/,
    );
    if (!match) return null;
    return {
      percent: parseFloat(match[1]),
      totalSize: match[2],
      speed: match[3],
      eta: match[4],
    };
  }
}
