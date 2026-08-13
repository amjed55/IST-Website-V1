import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const FILE_TYPES: Record<string, string> = {
  ...IMAGE_TYPES,
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

let s3Client: S3Client | null = null;

function storageConfig() {
  const bucket = process.env.S3_BUCKET?.trim();
  if (!bucket) return null;

  const publicUrl = process.env.S3_PUBLIC_URL?.replace(/\/+$/, '');
  if (!publicUrl) {
    throw new Error('S3_PUBLIC_URL is required when S3_BUCKET is configured.');
  }

  if (!s3Client) {
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    s3Client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      credentials:
        accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
    });
  }

  return { bucket, publicUrl, client: s3Client };
}

function validateUpload(file: File, imageOnly: boolean) {
  const allowed = imageOnly ? IMAGE_TYPES : FILE_TYPES;
  const ext = allowed[file.type];
  if (!ext) {
    throw new Error(
      imageOnly
        ? 'Only JPG, PNG, WebP, and GIF images are allowed.'
        : 'Only JPG, PNG, WebP, GIF, MP4, and WebM files are allowed.',
    );
  }
  const limit = imageOnly ? MAX_IMAGE_BYTES : MAX_MEDIA_BYTES;
  if (file.size <= 0 || file.size > limit) {
    throw new Error(
      `${imageOnly ? 'Image' : 'Media'} must be smaller than ${limit / 1024 / 1024}MB.`,
    );
  }
  return ext;
}

export async function saveUploadedImage(file: File, prefix = 'upload') {
  return save(file, prefix, true);
}

export async function saveUploadedFile(file: File, prefix = 'upload') {
  return save(file, prefix, false);
}

async function save(file: File, prefix: string, imageOnly: boolean) {
  const ext = validateUpload(file, imageOnly);
  const bytes = Buffer.from(await file.arrayBuffer());
  const safe = prefix.replace(/[^a-z0-9-_]/gi, '-').toLowerCase() || 'upload';
  const filename = `${safe}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
  const storage = storageConfig();

  if (storage) {
    const key = `uploads/${filename}`;
    await storage.client.send(
      new PutObjectCommand({
        Bucket: storage.bucket,
        Key: key,
        Body: bytes,
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return `${storage.publicUrl}/${key}`;
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}
