import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { getR2Client } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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
  } catch {
    return NextResponse.json({ exists: false }, { status: 404 });
  }
}
