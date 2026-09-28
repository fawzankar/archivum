import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { getResourceById } from '@/lib/resources';
import { getR2Client, r2KeyFromUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resource = await getResourceById(Number(id));
    if (!resource || resource.status !== 'approved') {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Local/public files stay local; the browser can stream them directly.
    if (!resource.file_url.startsWith('r2://') && resource.file_url.startsWith('/')) {
      return NextResponse.redirect(new URL(resource.file_url, request.url), 302);
    }
    if (!resource.file_url.startsWith('r2://')) {
      return NextResponse.redirect(resource.file_url, 302);
    }

    const key = resource.storage_key || r2KeyFromUrl(resource.file_url);
    const client = getR2Client();
    if (!key || !client || !process.env.R2_BUCKET_NAME) {
      return NextResponse.json({ error: 'Cloudflare R2 is not configured on the server.' }, { status: 503 });
    }

    const range = request.headers.get('range') || undefined;
    const object = await client.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ...(range ? { Range: range } : {}),
    }));

    if (!object.Body) {
      return NextResponse.json({ error: 'The document is empty or unavailable.' }, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', object.ContentType || resource.file_type || 'application/pdf');
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(resource.file_name || 'document.pdf')}"`);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=60');
    if (object.ContentLength !== undefined) headers.set('Content-Length', String(object.ContentLength));
    if (object.ContentRange) headers.set('Content-Range', object.ContentRange);
    if (object.ETag) headers.set('ETag', object.ETag);
    if (object.LastModified) headers.set('Last-Modified', object.LastModified.toUTCString());

    return new NextResponse(object.Body.transformToWebStream(), {
      status: range ? 206 : 200,
      headers,
    });
  } catch (error) {
    console.error('Resource file route failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not open file' }, { status: 500 });
  }
}
