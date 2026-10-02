import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function POST() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(
    { error: 'This upload endpoint has moved to Cloudflare R2. Use /api/r2-upload.' },
    { status: 410 }
  );
}
