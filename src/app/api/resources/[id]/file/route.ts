import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { stat } from 'fs/promises';
import path from 'path';
import { getResourceById } from '@/lib/resources';
import { getR2Client, r2KeyFromUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function contentDisposition(filename: string) {
  const safe = filename.replace(/[\r\n"]/g, '_');
  return `inline; filename="document.pdf"; filename*=UTF-8''${encodeURIComponent(safe)}`;
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

function baseHeaders(resource: { file_type: string; file_name: string }, size: number) {
  const headers = new Headers();
  headers.set('Content-Type', resource.file_type || 'application/pdf');
  headers.set('Content-Disposition', contentDisposition(resource.file_name || 'document.pdf'));
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=60');
  headers.set('Content-Length', String(size));
  return headers;
}

async function getResource(request: Request, id: string) {
  const resource = await getResourceById(Number(id));
  if (!resource || resource.status !== 'approved') {
    return null;
  }
  return resource;
}

export async function HEAD(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resource = await getResource(request, id);
    if (!resource) return new NextResponse(null, { status: 404 });

    if (resource.file_url.startsWith('/uploads/')) {
      const root = path.resolve(process.cwd(), 'public', 'uploads');
      const filename = decodeURIComponent(resource.file_url.slice('/uploads/'.length));
      const filePath = path.resolve(root, filename);
      if (!filePath.startsWith(`${root}${path.sep}`)) return new NextResponse(null, { status: 400 });
      const info = await stat(filePath);
      return new NextResponse(null, { status: 200, headers: baseHeaders(resource, info.size) });
    }

    const key = resource.storage_key || r2KeyFromUrl(resource.file_url);
    const client = getR2Client();
    if (!key || !client || !process.env.R2_BUCKET_NAME) return new NextResponse(null, { status: 503 });
    const object = await client.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
    const headers = baseHeaders(resource, Number(object.ContentLength || resource.file_size || 0));
    if (object.ETag) headers.set('ETag', object.ETag);
    if (object.LastModified) headers.set('Last-Modified', object.LastModified.toUTCString());
    return new NextResponse(null, { status: 200, headers });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resource = await getResource(request, id);
    if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });

    if (resource.file_url.startsWith('/uploads/')) {
      const root = path.resolve(process.cwd(), 'public', 'uploads');
      const filename = decodeURIComponent(resource.file_url.slice('/uploads/'.length));
      const filePath = path.resolve(root, filename);
      if (!filePath.startsWith(`${root}${path.sep}`)) return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
      const info = await stat(filePath);
      const range = parseRange(request.headers.get('range'), info.size);
      const headers = baseHeaders(resource, range ? range.end - range.start + 1 : info.size);
      if (range) headers.set('Content-Range', `bytes ${range.start}-${range.end}/${info.size}`);
      const stream = createReadStream(filePath, range ? { start: range.start, end: range.end } : undefined);
      return new Response(Readable.toWeb(stream) as ReadableStream, { status: range ? 206 : 200, headers });
    }

    const key = resource.storage_key || r2KeyFromUrl(resource.file_url);
    const client = getR2Client();
    if (!key || !client || !process.env.R2_BUCKET_NAME) {
      return NextResponse.json({ error: 'Cloud storage is not configured.' }, { status: 503 });
    }

    const rangeHeader = request.headers.get('range');
    const object = await client.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ...(rangeHeader ? { Range: rangeHeader } : {}),
    }));
    if (!object.Body) return NextResponse.json({ error: 'The document is unavailable.' }, { status: 404 });

    const size = Number(object.ContentLength || resource.file_size || 0);
    const headers = baseHeaders(resource, size);
    if (object.ContentRange) headers.set('Content-Range', object.ContentRange);
    if (object.ETag) headers.set('ETag', object.ETag);
    if (object.LastModified) headers.set('Last-Modified', object.LastModified.toUTCString());
    return new Response(object.Body.transformToWebStream(), { status: rangeHeader ? 206 : 200, headers });
  } catch (error) {
    console.error('Resource file request failed', error);
    return NextResponse.json({ error: 'Unable to open this document.' }, { status: 500 });
  }
}
