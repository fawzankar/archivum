import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';
import { queryOne } from './db';

function r2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

let r2Client: S3Client | null = null;

export const MAX_STORAGE_BYTES = 10_000_000_000; // 10 GB app-wide
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per file

export async function getStorageUsageBytes() {
  const row = await queryOne<{ total: number }>(
    "SELECT COALESCE(SUM(file_size),0) AS total FROM resources WHERE status != 'deleted'"
  );
  return Number(row?.total ?? 0);
}

export function formatStorageSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(0, bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
}

export function getStorageQuotaStatus(usedBytes: number) {
  const remainingBytes = Math.max(0, MAX_STORAGE_BYTES - usedBytes);
  return {
    usedBytes,
    limitBytes: MAX_STORAGE_BYTES,
    remainingBytes,
    percent: Math.min(100, (usedBytes / MAX_STORAGE_BYTES) * 100),
    used: formatStorageSize(usedBytes),
    remaining: formatStorageSize(remainingBytes),
    limit: '10 GB',
  };
}

export function getR2Client() {
  if (!r2Configured()) return null;
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return r2Client;
}

export function getR2PublicUrl(key: string) {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');
  return base ? `${base}/${key.split('/').map(encodeURIComponent).join('/')}` : `r2://${key}`;
}

export function isR2Url(url: string) {
  if (url.startsWith('r2://')) return url.slice(5).startsWith('uploads/');
  const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');
  return Boolean(base && url.startsWith(`${base}/`));
}

export function r2KeyFromUrl(url: string) {
  if (url.startsWith('r2://')) {
    const key = url.slice(5);
    return key.startsWith('uploads/') ? key : null;
  }
  const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');
  if (!base || !url.startsWith(`${base}/`)) return null;
  return decodeURIComponent(url.slice(base.length + 1));
}

export async function deleteStoredFile(urlOrKey: string) {
  if (r2Configured()) {
    const key = urlOrKey.includes('://') ? r2KeyFromUrl(urlOrKey) : urlOrKey;
    if (!key) return false;
    await getR2Client()!.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    }));
    return true;
  }

  if (urlOrKey.startsWith('/uploads/')) {
    try { await fs.unlink(path.join(process.cwd(), 'public', urlOrKey)); } catch {}
    return true;
  }
  return false;
}

/** Legacy/local helper retained for local development and compatibility. */
export async function storeUpload(file: File, buffer: Buffer, filename: string) {
  if (r2Configured()) {
    throw new Error('Direct browser uploads should use /api/r2-upload.');
  }

  if (process.env.VERCEL) {
    throw new Error('Cloudflare R2 is required on Vercel. Configure the R2 environment variables.');
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  const target = path.join(uploadsDir, filename);
  await fs.writeFile(target, buffer);
  return { url: `/uploads/${filename}`, key: `uploads/${filename}`, cleanup: async () => { try { await fs.unlink(target); } catch {} } };
}
