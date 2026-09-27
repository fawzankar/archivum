import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { getR2Client, getR2PublicUrl } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

function safeFilename(value: unknown) {
  const name = typeof value === 'string' ? value.trim().split('/').pop() || '' : '';
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 180);
}

export async function POST(request: Request) {
  try {
    const client = getR2Client();
    if (!client || !process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
      return NextResponse.json({ error: 'Cloudflare R2 is not configured.' }, { status: 503 });
    }

    const body = await request.json();
    const filename = safeFilename(body.filename);
    const contentType = typeof body.contentType === 'string' ? body.contentType.toLowerCase() : '';
    const size = Number(body.size);

    if (!filename) return NextResponse.json({ error: 'A filename is required.' }, { status: 400 });
    const extension = ALLOWED_EXTENSIONS.find((item) => filename.toLowerCase().endsWith(item));
    if (!extension || !ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json({ error: 'Only PDF, JPG, JPEG, and PNG files are allowed.' }, { status: 400 });
    }
    if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Files must be between 1 byte and 50 MB.' }, { status: 400 });
    }

    const key = `uploads/${Date.now()}-${crypto.randomUUID()}-${filename}`;
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });

    return NextResponse.json({
      uploadUrl,
      publicUrl: getR2PublicUrl(key),
      key,
      expiresIn: 900,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not prepare R2 upload.' },
      { status: 500 }
    );
  }
}
