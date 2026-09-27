import { DeleteObjectCommand, HeadBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { getR2Client, MAX_FILE_SIZE } from '@/lib/storage';
import { reserveStorageBytes, getStorageUsageWithReservations } from '@/lib/storage-quota';
import { initDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

function safeFilename(value: unknown) {
  const name = typeof value === 'string' ? value.trim().split('/').pop() || '' : '';
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 180);
}

export async function POST(request: Request) {
  try {
    await initDb();
    const client = getR2Client();
    if (!client || !process.env.R2_BUCKET_NAME) {
      return NextResponse.json({ error: 'Cloudflare R2 is not configured.' }, { status: 503 });
    }

    // Validate the configured R2 account/bucket/credentials before creating a
    // presigned URL. A presigned URL can be generated locally even when the
    // account ID or bucket is wrong; the browser then sees the resulting 403
    // as a generic CORS/fetch error. Fail here with the real server-side error.
    try {
      await client.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET_NAME }));
    } catch (error) {
      const err = error as { name?: string; Code?: string; code?: string; $metadata?: { httpStatusCode?: number }; message?: string };
      const status = err.$metadata?.httpStatusCode;
      const code = err.Code || err.code || err.name || 'R2_BUCKET_CHECK_FAILED';
      return NextResponse.json({
        error: `Cloudflare R2 bucket check failed (${code}${status ? `, HTTP ${status}` : ''}). Check R2_ACCOUNT_ID, R2_BUCKET_NAME, and that the R2 API token has Object Read & Write access to the archivum bucket.`,
        code: 'R2_CONFIGURATION_ERROR',
      }, { status: 503 });
    }

    // Verify write permission too. This catches the common case where the
    // S3 credentials can create a presigned URL but cannot actually write to
    // the selected bucket.
    const healthKey = `system/archivum-upload-check-${crypto.randomUUID()}.txt`;
    try {
      await client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: healthKey,
        Body: 'ARCHIVUM R2 upload check',
        ContentType: 'text/plain',
      }));
      await client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: healthKey,
      }));
    } catch (error) {
      const err = error as { name?: string; Code?: string; code?: string; $metadata?: { httpStatusCode?: number }; message?: string };
      const status = err.$metadata?.httpStatusCode;
      const code = err.Code || err.code || err.name || 'R2_WRITE_CHECK_FAILED';
      return NextResponse.json({
        error: `Cloudflare R2 write check failed (${code}${status ? `, HTTP ${status}` : ''}). Check R2_ACCOUNT_ID, R2_BUCKET_NAME, the R2 endpoint/jurisdiction, and that the R2 API token has Object Read & Write access to the archivum bucket.`,
        code: 'R2_WRITE_CONFIGURATION_ERROR',
      }, { status: 503 });
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
    const reservation = await reserveStorageBytes(key, size);
    if (!reservation.allowed) {
      const quota = await getStorageUsageWithReservations();
      return NextResponse.json({
        error: `ARCHIVUM storage is full. Only ${(quota.remainingBytes / 1_000_000).toFixed(1)} MB is available for new uploads.`,
        code: 'STORAGE_LIMIT_REACHED',
        usedBytes: quota.usedBytes,
        reservedBytes: quota.reservedBytes,
        remainingBytes: quota.remainingBytes,
        limitBytes: 10_000_000_000,
      }, { status: 507 });
    }

    // Sign the exact Content-Type that the browser will send. Cloudflare R2
    // requires the client header to match when ContentType is included in the
    // presigned PutObject request.
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });

    return NextResponse.json({
      uploadUrl,
      fileUrl: `r2://${key}`,
      key,
      expiresIn: 900,
      reservationExpiresAt: reservation.expiresAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not prepare the Cloudflare R2 upload.' },
      { status: 500 }
    );
  }
}
