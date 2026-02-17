import type { Readable } from 'stream';

export interface UploadOptions {
  accessToken: string;
  videoStream: Readable;
  title: string;
  description?: string | null;
  tags?: string[];
  privacyStatus?: string;
  uploadMode?: string | null; // TikTok only: 'direct_post' | 'inbox'
  categoryId?: string;
  uploadAsShort?: boolean;
  totalBytes?: number;
  onProgress?: (progress: { percent: number; phase: string }) => void;
}

export interface UploadResult {
  platformVideoId: string;
  publishUrl: string | null;
  status: string;
}

export interface IPlatformUploader {
  upload(options: UploadOptions): Promise<UploadResult>;
}
