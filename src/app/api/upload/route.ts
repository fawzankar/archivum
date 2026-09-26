import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { execute, initDb } from '@/lib/db';
import { generateSlug, checkForDuplicates } from '@/lib/resources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

function text(value: unknown, max = 5000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();

    const title = text(body.title, 200);
    const class_level = Number(body.class_level);
    const board = text(body.board, 100) || 'JKBOSE';
    const subject = text(body.subject, 100);
    const resource_type = text(body.resource_type, 100);
    const paper_type = text(body.paper_type, 100) || null;
    const year = body.year === null || body.year === undefined ? null : Number(body.year);
    const school_name = text(body.school_name, 200) || null;
    const contributor_name = text(body.contributorName, 80);
    const chapter = text(body.chapter, 200) || null;
    const topic = text(body.topic, 300) || null;
    const description = text(body.description, 5000) || null;
    const blobUrl = text(body.blobUrl, 1000);
    const fileName = text(body.fileName, 255);
    const fileType = text(body.fileType, 100);
    const fileSize = Number(body.fileSize);
    const fileHash = text(body.fileHash, 128);

    if (!title || ![9, 10, 11, 12].includes(class_level) || !subject || !resource_type || !contributor_name) {
      return NextResponse.json({ error: 'Missing or invalid required metadata.' }, { status: 400 });
    }
    if (!blobUrl || !blobUrl.startsWith('https://') || !blobUrl.includes('.blob.vercel-storage.com/')) {
      return NextResponse.json({ error: 'Invalid Vercel Blob URL.' }, { status: 400 });
    }
    if (!ALLOWED_CONTENT_TYPES.includes(fileType) || !Number.isInteger(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Invalid uploaded file metadata.' }, { status: 400 });
    }
    if (!fileHash || !/^[a-f0-9]{64}$/i.test(fileHash)) {
      return NextResponse.json({ error: 'Invalid file hash.' }, { status: 400 });
    }

    // Confirm the object that was uploaded to Blob is not larger than our
    // application limit. This is a small HEAD request, not a file download.
    const head = await fetch(blobUrl, { method: 'HEAD', cache: 'no-store' });
    if (!head.ok) {
      return NextResponse.json({ error: 'The uploaded file could not be verified.' }, { status: 400 });
    }
    const remoteSize = Number(head.headers.get('content-length') || fileSize);
    const remoteType = (head.headers.get('content-type') || fileType).split(';')[0].toLowerCase();
    if (!Number.isFinite(remoteSize) || remoteSize <= 0 || remoteSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Uploaded file exceeds the 50 MB limit.' }, { status: 400 });
    }
    if (!ALLOWED_CONTENT_TYPES.includes(remoteType)) {
      return NextResponse.json({ error: 'Uploaded file type is not allowed.' }, { status: 400 });
    }

    const dupResult = await checkForDuplicates(fileHash, title, class_level, subject);
    if (dupResult.isDuplicate) {
      await del(blobUrl).catch(() => {});
      return NextResponse.json({ error: dupResult.reason, duplicate: dupResult.existing }, { status: 409 });
    }

    const now = new Date().toISOString();
    let result: Awaited<ReturnType<typeof execute>>;
    try {
      result = await execute(
      `INSERT INTO resources (slug,title,description,class_level,board,subject,chapter,topic,resource_type,paper_type,year,school_name,contributor_name,file_url,file_size,file_type,file_name,file_hash,status,featured,views,downloads,average_rating,rating_count,tags,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',0,0,0,0,0,?,?,?)`,
      [
        generateSlug(title), title, description, class_level, board, subject, chapter, topic,
        resource_type, paper_type, Number.isFinite(year) ? year : null, school_name, contributor_name,
        blobUrl, remoteSize, remoteType, fileName || 'upload', fileHash,
        `${subject.toLowerCase()},${resource_type.toLowerCase()},class${class_level}`, now, now,
      ],
    );
    } catch (error) {
      await del(blobUrl).catch(() => {});
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Resource submitted successfully! It has been sent to the SJS CONNECT moderation team.',
      resourceId: result.lastInsertRowid,
      compressedSize: remoteSize,
      duplicateWarning: null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
