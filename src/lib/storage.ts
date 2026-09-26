import { del, put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

export async function storeUpload(file: File, buffer: Buffer, filename: string) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type || 'application/octet-stream',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url, cleanup: async () => { try { await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN }); } catch {} } };
  }

  if (process.env.VERCEL) {
    throw new Error('BLOB_READ_WRITE_TOKEN is required on Vercel for uploads. Connect Vercel Blob and redeploy.');
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  const target = path.join(uploadsDir, filename);
  await fs.writeFile(target, buffer);
  return { url: `/uploads/${filename}`, cleanup: async () => { try { await fs.unlink(target); } catch {} } };
}
