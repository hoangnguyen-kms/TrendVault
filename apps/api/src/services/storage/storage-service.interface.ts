import { Readable } from 'stream';

export interface UploadResult {
  key: string;
  bucket: string;
  size: number;
  etag: string;
}

export interface ObjectMetadata {
  contentType: string;
  contentLength: number;
  lastModified: Date;
  etag: string;
}

export interface IStorageService {
  upload(key: string, stream: Readable, metadata?: Record<string, string>): Promise<UploadResult>;
  getReadStream(key: string): Promise<Readable>;
  getDownloadUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getMetadata(key: string): Promise<ObjectMetadata | null>;
}
