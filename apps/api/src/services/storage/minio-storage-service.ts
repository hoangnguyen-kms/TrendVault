import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { env } from '../../config/environment.js';
import type { IStorageService, UploadResult, ObjectMetadata } from './storage-service.interface.js';

export class MinIOStorageService implements IStorageService {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = env.S3_BUCKET;
    this.client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY!,
        secretAccessKey: env.S3_SECRET_KEY!,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async upload(
    key: string,
    stream: Readable,
    metadata?: Record<string, string>,
  ): Promise<UploadResult> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        Metadata: metadata,
      },
      queueSize: 4,
      partSize: 10 * 1024 * 1024, // 10MB parts
    });

    const result = await upload.done();
    return {
      key,
      bucket: this.bucket,
      size: 0,
      etag: result.ETag ?? '',
    };
  }

  async getReadStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const response = await this.client.send(command);
    return response.Body as Readable;
  }

  async getDownloadUrl(key: string, expiresIn = 900): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(key: string): Promise<ObjectMetadata | null> {
    try {
      const result = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        contentType: result.ContentType ?? 'application/octet-stream',
        contentLength: result.ContentLength ?? 0,
        lastModified: result.LastModified ?? new Date(),
        etag: result.ETag ?? '',
      };
    } catch {
      return null;
    }
  }
}
