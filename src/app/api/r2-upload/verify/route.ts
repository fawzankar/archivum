import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { getR2Client } from '@/lib/storage';
import { getAdminSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!await getAdminSession()) return NextResponse.json({ exists: false, error: 'Admin authentication required.' }, { status: 401 });
  try {
    const client = getR2Client();
    const bucket = process.env.R2_BUCKET_NAME;
    const key = new URL(request.url).searchParams.get('key') || '';
    if (!client || !bucket || !key.startsWith('uploads/')) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return NextResponse.json({
      exists: true,
      size: Number(head.ContentLength || 0),
      contentType: head.ContentType || null,
    });
  } catch (error) {
    const err = error as { name?: string; Code?: string; code?: string; $metadata?: { httpStatusCode?: number }; message?: string };
    const status = err.$metadata?.httpStatusCode;
    const code = err.Code || err.code || err.name || 'R2_VERIFY_FAILED';
    return NextResponse.json({ exists: false, code, status: status ?? null, error: err.message || 'Could not verify the R2 object.' }, { status: 200 });
  }
}
