import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { deleteStoredFile } from '@/lib/storage';

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });

  try {
    const { id } = await request.json();
    const resourceId = Number(id);
    if (!Number.isInteger(resourceId) || resourceId <= 0) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const resource = await queryOne<{ file_url: string; storage_key: string | null; photo_keys: string | null }>(
      'SELECT file_url,storage_key,photo_keys FROM resources WHERE id=?',
      [resourceId],
    );
    if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });

    const storageKeys = [
      resource.storage_key || resource.file_url,
      ...(resource.photo_keys ? JSON.parse(resource.photo_keys) as string[] : []),
    ].filter(Boolean);

    for (const key of storageKeys) {
      const removed = await deleteStoredFile(key);
      if (!removed) return NextResponse.json({ error: `Stored file could not be removed: ${key}` }, { status: 502 });
    }

    await execute('DELETE FROM storage_reservations WHERE storage_key IN (' + storageKeys.map(() => '?').join(',') + ')', storageKeys);
    await execute('DELETE FROM ratings WHERE resource_id=?', [resourceId]);
    await execute('DELETE FROM downloads WHERE resource_id=?', [resourceId]);
    await execute('DELETE FROM resources WHERE id=?', [resourceId]);

    return NextResponse.json({ success: true, message: 'Resource and all stored files were permanently deleted.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Deletion failed' }, { status: 500 });
  }
}
