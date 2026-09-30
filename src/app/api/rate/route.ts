import { NextResponse } from 'next/server';
import { rateResource } from '@/lib/resources';
import { queryOne } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const resourceId = Number(url.searchParams.get('resourceId'));
    const sessionId = String(url.searchParams.get('sessionId') || '').trim().slice(0, 128);

    if (!Number.isInteger(resourceId) || resourceId <= 0 || !sessionId) {
      return NextResponse.json({ user_rating: 0 }, { status: 200 });
    }

    const row = await queryOne<{ rating: number }>(
      `SELECT rating FROM ratings WHERE resource_id=? AND session_id=? LIMIT 1`,
      [resourceId, sessionId],
    );
    const stats = await queryOne<{ avg_rating: number | null; count: number }>(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS count FROM ratings WHERE resource_id=?`,
      [resourceId],
    );
    const count = Number(stats?.count ?? 0);
    const average = count > 0 ? Math.round(Number(stats?.avg_rating ?? 0) * 10) / 10 : 0;
    return NextResponse.json({
      user_rating: Number(row?.rating ?? 0),
      average_rating: average,
      rating_count: count,
    });
  } catch {
    return NextResponse.json({ user_rating: 0 }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { resourceId, sessionId, rating } = await request.json();
    const id = Number(resourceId);
    const sid = String(sessionId || '').trim();

    if (!Number.isInteger(id) || id <= 0 || !sid) {
      return NextResponse.json({ error: 'Invalid rating request' }, { status: 400 });
    }

    const result = await rateResource(id, sid, Number(rating));
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Rating failed' },
      { status: 500 },
    );
  }
}
