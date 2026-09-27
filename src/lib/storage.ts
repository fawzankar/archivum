import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';

function r2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
  );
}

let r2Client: S3Client | null = null;

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
  if (!base) throw new Error('R2_PUBLIC_URL is not configured.');
  return `${base}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export function isR2Url(url: string) {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');
  return Boolean(base && url.startsWith(`${base}/`));
}

export function r2KeyFromUrl(url: string) {
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
