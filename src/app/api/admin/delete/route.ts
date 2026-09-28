import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { deleteStoredFile } from '@/lib/storage';

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });

  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });

    const resource = await queryOne<{ file_url: string; storage_key: string | null; photo_keys: string | null }>(
      'SELECT file_url,storage_key,photo_keys FROM resources WHERE id=?',
      [id],
    );
    if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });

    const photoKeys = resource.photo_keys ? JSON.parse(resource.photo_keys) : [];
    const storedObjects = [resource.storage_key || resource.file_url, ...(Array.isArray(photoKeys) ? photoKeys : [])].filter(Boolean) as string[];
    const failures: string[] = [];

    for (const object of storedObjects) {
      try {
        const removed = await deleteStoredFile(object);
        if (!removed) failures.push(object);
      } catch {
        failures.push(object);
      }
    }

    if (failures.length) {
      return NextResponse.json({ error: 'Some stored files could not be removed. The database record was kept.', failures: failures.length }, { status: 502 });
    }

    await execute('DELETE FROM ratings WHERE resource_id=?', [id]);
    await execute('DELETE FROM downloads WHERE resource_id=?', [id]);
    await execute('DELETE FROM storage_reservations WHERE storage_key=?', [resource.storage_key || resource.file_url]);
    await execute('DELETE FROM resources WHERE id=?', [id]);

    return NextResponse.json({ success: true, message: 'Resource and all associated files and records were permanently deleted.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Deletion failed' }, { status: 500 });
  }
}
