import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { execute, initDb } from '@/lib/db';
import { generateSlug, checkForDuplicates } from '@/lib/resources';
import { isR2Url, deleteStoredFile, getR2Client, getStorageUsageBytes, MAX_FILE_SIZE, MAX_STORAGE_BYTES } from '@/lib/storage';
import { getReservation, releaseStorageReservation } from '@/lib/storage-quota';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const PHOTO_CONTENT_TYPES = ['image/jpeg', 'image/png'];
const MAX_PHOTOS = 6;

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
    const fileUrl = text(body.fileUrl || body.blobUrl, 1000);
    const storageKey = text(body.storageKey, 500);
    const fileName = text(body.fileName, 255);
    const fileType = text(body.fileType, 100);
    const fileSize = Number(body.fileSize);
    const fileHash = text(body.fileHash, 128);
    const photoKeys = Array.isArray(body.photoKeys) ? body.photoKeys.filter((key: unknown): key is string => typeof key === 'string' && key.startsWith('uploads/')).slice(0, MAX_PHOTOS) : [];

    if (!title || ![9, 10, 11, 12].includes(class_level) || !subject || !resource_type || !contributor_name) {
      return NextResponse.json({ error: 'Missing or invalid required metadata.' }, { status: 400 });
    }
    if (!fileUrl || !isR2Url(fileUrl)) {
      return NextResponse.json({ error: 'Invalid Cloudflare R2 file reference.' }, { status: 400 });
    }
    if (!storageKey || !storageKey.startsWith('uploads/')) {
      return NextResponse.json({ error: 'Invalid Cloudflare R2 storage key.' }, { status: 400 });
    }
    if (!ALLOWED_CONTENT_TYPES.includes(fileType) || !Number.isInteger(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Invalid uploaded file metadata.' }, { status: 400 });
    }
    if (!fileHash || !/^[a-f0-9]{64}$/i.test(fileHash)) {
      return NextResponse.json({ error: 'Invalid file hash.' }, { status: 400 });
    }

    const reservation = await getReservation(storageKey);
    if (!reservation || Number(reservation.file_size) !== fileSize) {
      return NextResponse.json({ error: 'Upload reservation expired. Please upload the file again.' }, { status: 409 });
    }
    const r2Client = getR2Client();
    const objectKey = storageKey.startsWith('r2://') ? storageKey.slice(5) : storageKey;
    if (!r2Client) {
      await releaseStorageReservation(storageKey);
      return NextResponse.json({ error: 'Cloudflare R2 is not configured on the server.' }, { status: 503 });
    }
    let head;
    try {
      head = await r2Client.send(new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: objectKey,
      }));
    } catch {
      await releaseStorageReservation(storageKey);
      return NextResponse.json({ error: 'The uploaded file could not be verified in Cloudflare R2.' }, { status: 400 });
    }
    const remoteSize = Number(head.ContentLength || fileSize);
    const remoteType = (head.ContentType || fileType).split(';')[0].toLowerCase();
    if (!Number.isFinite(remoteSize) || remoteSize <= 0 || remoteSize > MAX_FILE_SIZE) {
      await releaseStorageReservation(storageKey);
      await deleteStoredFile(storageKey).catch(() => {});
      return NextResponse.json({ error: 'Uploaded file exceeds the 50 MB limit.' }, { status: 400 });
    }
    if (!ALLOWED_CONTENT_TYPES.includes(remoteType)) {
      await releaseStorageReservation(storageKey);
      await deleteStoredFile(storageKey).catch(() => {});
      return NextResponse.json({ error: 'Uploaded file type is not allowed.' }, { status: 400 });
    }

    const verifiedPhotoKeys: string[] = [];
    let verifiedPhotoBytes = 0;
    try {
      for (const photoKey of photoKeys) {
        const photoReservation = await getReservation(photoKey);
        if (!photoReservation) throw new Error('One of the supporting photo upload reservations expired.');
        const photoHead = await r2Client.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: photoKey }));
        const photoType = (photoHead.ContentType || '').split(';')[0].toLowerCase();
        const photoSize = Number(photoHead.ContentLength || photoReservation.file_size);
        if (!PHOTO_CONTENT_TYPES.includes(photoType) || !Number.isFinite(photoSize) || photoSize <= 0 || photoSize > 8 * 1024 * 1024) {
          throw new Error('One of the supporting photos is invalid or exceeds the 8 MB limit.');
        }
        verifiedPhotoKeys.push(photoKey);
        verifiedPhotoBytes += photoSize;
      }
    } catch (photoError) {
      await releaseStorageReservation(storageKey);
      await deleteStoredFile(storageKey).catch(() => {});
      await Promise.all(photoKeys.map(async (key: string) => { await releaseStorageReservation(key).catch(() => {}); await deleteStoredFile(key).catch(() => {}); }));
      return NextResponse.json({ error: photoError instanceof Error ? photoError.message : 'Supporting photo verification failed.' }, { status: 400 });
    }

    const usedBytes = await getStorageUsageBytes();
    const cleanupPhotos = async () => { await Promise.all(photoKeys.map(async (key: string) => { await releaseStorageReservation(key).catch(() => {}); await deleteStoredFile(key).catch(() => {}); })); };
    if (usedBytes + remoteSize + verifiedPhotoBytes > MAX_STORAGE_BYTES) {
      await releaseStorageReservation(storageKey);
      await deleteStoredFile(storageKey).catch(() => {});
      await cleanupPhotos();
      const remaining = Math.max(0, MAX_STORAGE_BYTES - usedBytes);
      return NextResponse.json({
        error: `ARCHIVUM has a hard 10 GB storage limit. Only ${(remaining / 1_000_000).toFixed(1)} MB remains.`,
        code: 'STORAGE_LIMIT_REACHED',
        usedBytes,
        remainingBytes: remaining,
        limitBytes: MAX_STORAGE_BYTES,
      }, { status: 507 });
    }

    const dupResult = await checkForDuplicates(fileHash, title, class_level, subject);
    if (dupResult.isDuplicate) {
      await releaseStorageReservation(storageKey);
      await deleteStoredFile(storageKey).catch(() => {});
      await cleanupPhotos();
      return NextResponse.json({ error: dupResult.reason, duplicate: dupResult.existing }, { status: 409 });
    }

    const now = new Date().toISOString();
    let result: Awaited<ReturnType<typeof execute>>;
    try {
      result = await execute(
      `INSERT INTO resources (slug,title,description,class_level,board,subject,chapter,topic,resource_type,paper_type,year,school_name,contributor_name,file_url,storage_key,file_size,file_type,file_name,file_hash,status,featured,views,downloads,average_rating,rating_count,tags,created_at,updated_at,photo_keys)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',0,0,0,0,0,?,?,?,?)`,
      [
        generateSlug(title), title, description, class_level, board, subject, chapter, topic,
        resource_type, paper_type, Number.isFinite(year) ? year : null, school_name, contributor_name,
        fileUrl, storageKey, remoteSize, remoteType, fileName || 'upload', fileHash,
        `${subject.toLowerCase()},${resource_type.toLowerCase()},class${class_level}`, now, now,
        verifiedPhotoKeys.length ? JSON.stringify(verifiedPhotoKeys) : null,
      ],
    );
    } catch (error) {
      await releaseStorageReservation(storageKey);
      await deleteStoredFile(storageKey).catch(() => {});
      await cleanupPhotos();
      throw error;
    }

    await releaseStorageReservation(storageKey);
    await Promise.all(verifiedPhotoKeys.map(key => releaseStorageReservation(key).catch(() => {})));

    return NextResponse.json({
      success: true,
      message: 'Resource submitted successfully! It has been sent to the ARCHIVUM moderation team.',
      resourceId: Number(result.lastInsertRowid),
      compressedSize: remoteSize,
      duplicateWarning: null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
