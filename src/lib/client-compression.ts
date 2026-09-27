import { PDFDocument } from 'pdf-lib';

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

async function compressImage(file: File, onProgress?: (message: string) => void): Promise<File> {
  if (typeof window === 'undefined') return file;

  const bitmap = await createImageBitmap(file);
  try {
    const maxDimension = 2400;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    // White background avoids black/transparent pixels when PNGs are converted to JPEG.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    onProgress?.('Optimizing image…');

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.78)
    );
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^/.]+$/, '');
    return new File([blob], `${base}.jpg`, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}

async function compressPdf(file: File, onProgress?: (message: string) => void): Promise<File> {
  // pdf-lib is deliberately used instead of a package with optional WASM imports.
  // Next/Turbopack can build this reliably on Vercel. Object streams and Flate
  // compression can reduce PDFs whose content streams are not already compressed.
  const source = await file.arrayBuffer();
  onProgress?.('Compressing PDF…');
  const pdf = await PDFDocument.load(source, { ignoreEncryption: false });
  const bytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  if (bytes.byteLength >= file.size) return file;
  return new File([bytes], file.name, {
    type: 'application/pdf',
    lastModified: file.lastModified,
  });
}

/**
 * Client-side upload optimization. Images get genuine canvas re-encoding and
 * downscaling. PDFs get safe object-stream/Flate optimization. We always keep
 * the original when the optimized result is not smaller.
 */
export async function compressUpload(file: File, onProgress?: (message: string) => void): Promise<File> {
  const lower = file.name.toLowerCase();
  try {
    if (lower.endsWith('.pdf')) return await compressPdf(file, onProgress);
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')) {
      return await compressImage(file, onProgress);
    }
  } catch {
    // Compression is optional optimization and must never block a valid upload.
  }
  return file;
}

export async function sha256(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
