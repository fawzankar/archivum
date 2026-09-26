import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const reviewId = Number(id);
  const body = await request.json();
  const status = body.status === 'approved' || body.status === 'rejected' ? body.status : null;
  if (!Number.isInteger(reviewId) || !status) return NextResponse.json({ error: 'Invalid review action' }, { status: 400 });
  await execute('UPDATE reviews SET status=? WHERE id=?', [status, reviewId]);
  return NextResponse.json({ success: true });
}
