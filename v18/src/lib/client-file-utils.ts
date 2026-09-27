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

export async function sha256(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
