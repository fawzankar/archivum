import { compress, compressPDF } from '@fileslim/compress';

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const PDF_SIGNATURE = '%PDF-';

function isPdf(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes.subarray(0, 5)) === PDF_SIGNATURE;
}

function isJpeg(bytes: Uint8Array) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes: Uint8Array) {
  return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
    bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
}

export function validateFileSignature(file: File, bytes: Uint8Array) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return isPdf(bytes);
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return isJpeg(bytes);
  if (name.endsWith('.png')) return isPng(bytes);
  return false;
}

/**
 * Real client-side compression.
 *
 * PDFs are processed by FileSlim's embedded-image recompression pipeline rather
 * than merely being re-saved with pdf-lib. Images are recompressed with a
 * quality/resolution ceiling. In every case we keep the original when the
 * result is not actually smaller, so compression can never make the upload
 * larger.
 */
export async function compressUpload(file: File, onProgress?: (message: string) => void): Promise<File> {
  const lower = file.name.toLowerCase();

  try {
    onProgress?.(lower.endsWith('.pdf') ? 'Compressing PDF images…' : 'Optimizing image…');

    const result = lower.endsWith('.pdf')
      ? await compressPDF(file, {
          mode: 'balanced',
          imageQuality: 0.7,
          maxImageDimension: 1600,
          stripMetadata: true,
          onProgress: (...args: any[]) => {
            const pct = typeof args[1] === 'number' ? args[1] : (typeof args[0] === 'number' ? args[0] : NaN);
            if (Number.isFinite(pct)) onProgress?.(`Compressing PDF… ${Math.round(pct)}%`);
          },
        })
      : await compress(file, {
          mode: 'best',
          quality: 0.82,
          maxWidth: 2400,
          format: lower.endsWith('.png') ? 'png' : 'jpeg',
          stripMetadata: true,
        });

    if (!result?.blob || result.blob.size >= file.size) {
      return file;
    }

    const extension = lower.endsWith('.pdf') ? '.pdf' : lower.endsWith('.png') ? '.png' : '.jpg';
    const base = file.name.replace(/\.[^/.]+$/, '');

    return new File([result.blob], `${base}${extension}`, {
      type: lower.endsWith('.pdf') ? 'application/pdf' : lower.endsWith('.png') ? 'image/png' : 'image/jpeg',
      lastModified: file.lastModified,
    });
  } catch {
    // Compression is an optimization, never a reason to block a valid upload.
    return file;
  }
}

export async function sha256(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
