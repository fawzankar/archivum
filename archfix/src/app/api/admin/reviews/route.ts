import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getPendingReviews } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ reviews: await getPendingReviews() });
}
