import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function saveUploadedImage(file: File, prefix = 'upload') {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || '.jpg';
  const safe = prefix.replace(/[^a-z0-9-_]/gi, '-').toLowerCase() || 'upload';
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  const filename = `${safe}-${Date.now()}${ext}`;
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}
