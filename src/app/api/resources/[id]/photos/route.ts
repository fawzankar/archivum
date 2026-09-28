import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { getResourceById } from '@/lib/resources';
import { getR2Client } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resource = await getResourceById(Number(id));
    if (!resource || resource.status !== 'approved') return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    const keys: string[] = resource.photo_keys ? JSON.parse(resource.photo_keys) : [];
    const client = getR2Client();
    if (!client || !process.env.R2_BUCKET_NAME || !keys.length) return NextResponse.json({ photos: [] });
    const photos = await Promise.all(keys.slice(0, 6).map(async (key: string) => ({
      key,
      url: await getSignedUrl(client, new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }), { expiresIn: 900 }),
    })));
    return NextResponse.json({ photos });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not load photos' }, { status: 500 });
  }
}
