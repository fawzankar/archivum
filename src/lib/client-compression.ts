import { PDFDocument } from 'pdf-lib';

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const PDF_SIGNATURE = '%PDF-';

function isPdf(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes.subarray(0, 5)) === PDF_SIGNATURE;
}

function isJpeg(bytes: Uint8Array) {
  return (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  );
}

function isPng(bytes: Uint8Array) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

export function validateFileSignature(file: File, bytes: Uint8Array) {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) return isPdf(bytes);

  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
    return isJpeg(bytes);
  }

  if (name.endsWith('.png')) return isPng(bytes);

  return false;
}

async function compressPdf(file: File): Promise<Blob> {
  try {
    const source = await file.arrayBuffer();

    const pdf = await PDFDocument.load(source, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    const bytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
      objectsPerTick: 100,
    });

    // Never replace a smaller source with a larger "compressed" PDF.
    if (bytes.byteLength >= file.size) return file;

    return new Blob(
      [
        bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength
        ) as ArrayBuffer,
      ],
      { type: 'application/pdf' }
    );
  } catch {
    // Some PDFs are already optimized/encrypted in ways pdf-lib cannot rewrite.
    return file;
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The image could not be decoded.'));
    };

    image.src = url;
  });
}

async function compressImage(file: File): Promise<Blob> {
  try {
    const image = await loadImage(file);

    const maxDimension = 2400;

    const scale = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight)
    );

    const width = Math.max(
      1,
      Math.round(image.naturalWidth * scale)
    );

    const height = Math.max(
      1,
      Math.round(image.naturalHeight * scale)
    );

    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) return file;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    context.drawImage(image, 0, 0, width, height);

    // JPEG gets meaningful lossy compression.
    // PNG is kept lossless unless the browser happens to produce a smaller PNG.
    const outputType =
      file.type === 'image/jpeg' || file.type === 'image/jpg'
        ? 'image/jpeg'
        : 'image/png';

    const quality =
      outputType === 'image/jpeg' ? 0.82 : undefined;

    const compressed = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outputType, quality)
    );

    return compressed && compressed.size < file.size
      ? compressed
      : file;
  } catch {
    return file;
  }
}

export async function compressUpload(file: File): Promise<File> {
  const lower = file.name.toLowerCase();

  const compressed = lower.endsWith('.pdf')
    ? await compressPdf(file)
    : await compressImage(file);

  const extension = lower.endsWith('.pdf')
    ? '.pdf'
    : lower.endsWith('.png')
      ? '.png'
      : '.jpg';

  const base = file.name.replace(/\.[^/.]+$/, '');

  return new File(
    [compressed],
    `${base}${extension}`,
    {
      type: compressed.type || file.type,
      lastModified: file.lastModified,
    }
  );
}

export async function sha256(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    await file.arrayBuffer()
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}