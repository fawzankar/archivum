import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import path from 'path';
import { getResourceById } from '@/lib/resources';
import { getR2Client, r2KeyFromUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function contentDisposition(filename: string) {
  const safe = filename.replace(/[\r\n"]/g, '_');
  return `inline; filename="document.pdf"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}

function headersFor(resource: { file_type: string; file_name: string }, size: number) {
  const headers = new Headers();
  headers.set('Content-Type', resource.file_type || 'application/pdf');
  headers.set('Content-Disposition', contentDisposition(resource.file_name || 'document.pdf'));
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(size));
  headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  headers.set('X-Content-Type-Options', 'nosniff');
  return headers;
}

function responseBody(bytes: Uint8Array) {
  return new Blob([Uint8Array.from(bytes).buffer]);
}

function parseRange(value: string | null, size: number) {
  if (!value) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match) return null;
  let start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2] || 0));
  let end = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) return null;
  end = Math.min(end, size - 1);
  return { start, end };
}

async function approvedResource(id: string) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) return null;
  const resource = await getResourceById(numericId);
  return resource?.status === 'approved' ? resource : null;
}

async function localPathFor(url: string) {
  if (!url.startsWith('/uploads/')) return null;
  const root = path.resolve(process.cwd(), 'public', 'uploads');
  const relative = decodeURIComponent(url.slice('/uploads/'.length));
  const filePath = path.resolve(root, relative);
  if (!filePath.startsWith(`${root}${path.sep}`)) throw new Error('Invalid file path');
  return filePath;
}

export async function HEAD(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resource = await approvedResource(id);
    if (!resource) return new NextResponse(null, { status: 404 });

    const localPath = await localPathFor(resource.file_url);
    if (localPath) {
      const info = await stat(localPath);
      return new NextResponse(null, { status: 200, headers: headersFor(resource, info.size) });
    }

    const key = resource.storage_key || r2KeyFromUrl(resource.file_url);
    const client = getR2Client();
    if (!key || !client || !process.env.R2_BUCKET_NAME) return new NextResponse(null, { status: 503 });
    const object = await client.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
    const headers = headersFor(resource, Number(object.ContentLength || resource.file_size || 0));
    if (object.ETag) headers.set('ETag', object.ETag);
    return new NextResponse(null, { status: 200, headers });
  } catch (error) {
    console.error('[resource-file:HEAD]', error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resource = await approvedResource(id);
    if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });

    const localPath = await localPathFor(resource.file_url);
    if (localPath) {
      const info = await stat(localPath);
      const range = parseRange(request.headers.get('range'), info.size);
      const start = range?.start ?? 0;
      const end = range?.end ?? info.size - 1;
      const stream = createReadStream(localPath, { start, end });
      const headers = headersFor(resource, end - start + 1);
      if (range) {
        headers.set('Content-Range', `bytes ${range.start}-${range.end}/${info.size}`);
        return new NextResponse(Readable.toWeb(stream) as ReadableStream, { status: 206, headers });
      }
      return new NextResponse(Readable.toWeb(stream) as ReadableStream, { status: 200, headers });
    }

    const key = resource.storage_key || r2KeyFromUrl(resource.file_url);
    const client = getR2Client();
    if (!key || !client || !process.env.R2_BUCKET_NAME) {
      return NextResponse.json({ error: 'Cloud storage is not configured.' }, { status: 503 });
    }

    const requestedRange = request.headers.get('range');
    const object = await client.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ...(requestedRange ? { Range: requestedRange } : {}),
    }));
    if (!object.Body) return NextResponse.json({ error: 'The document is unavailable.' }, { status: 404 });

    const bytes = await object.Body.transformToByteArray();
    const headers = headersFor(resource, bytes.byteLength);
    if (object.ETag) headers.set('ETag', object.ETag);
    if (object.ContentRange) headers.set('Content-Range', object.ContentRange);
    const partial = Boolean(object.ContentRange);
    return new NextResponse(responseBody(bytes), { status: partial ? 206 : 200, headers });
  } catch (error) {
    console.error('[resource-file:GET]', error);
    return NextResponse.json({ error: 'Unable to open this document.' }, { status: 500 });
  }
}
