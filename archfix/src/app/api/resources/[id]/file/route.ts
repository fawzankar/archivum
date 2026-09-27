import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { getResourceById } from '@/lib/resources';
import { getR2Client, r2KeyFromUrl } from '@/lib/storage';
export const dynamic='force-dynamic';
export const runtime='nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resource = await getResourceById(Number(id));
    if (!resource || resource.status !== 'approved') return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    const key = resource.storage_key || r2KeyFromUrl(resource.file_url);
    const client = getR2Client();
    if (key && client && process.env.R2_BUCKET_NAME) {
      const url = await getSignedUrl(client, new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }), { expiresIn: 900 });
      return NextResponse.redirect(url, 302);
    }
    if (!resource.file_url.startsWith('r2://')) return NextResponse.redirect(resource.file_url, 302);
    return NextResponse.json({ error: 'Cloudflare R2 is not configured on the server.' }, { status: 503 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not open file' }, { status: 500 });
  }
}
