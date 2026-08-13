import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

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
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  const filename = `${safe}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}
