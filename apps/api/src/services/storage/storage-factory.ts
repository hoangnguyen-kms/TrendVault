import { env } from '../../config/environment.js';
import type { IStorageService } from './storage-service.interface.js';
import { MinIOStorageService } from './minio-storage-service.js';

let storageInstance: IStorageService | null = null;

/** Returns a singleton storage service based on STORAGE_BACKEND env var */
export function getStorageService(): IStorageService {
  if (!storageInstance) {
    switch (env.STORAGE_BACKEND) {
      case 'minio':
      case 's3':
        storageInstance = new MinIOStorageService();
        break;
      case 'local':
        // Local fallback uses the same S3-compatible client pointing at MinIO
        storageInstance = new MinIOStorageService();
        break;
      default:
        throw new Error(`Unknown storage backend: ${env.STORAGE_BACKEND}`);
    }
  }
  return storageInstance;
}
