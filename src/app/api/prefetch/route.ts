import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET() {
  try {
    const rows = await query<{ slug: string; id: number }>(
      `SELECT slug, id FROM resources WHERE status='approved' ORDER BY created_at DESC`
    );
    return NextResponse.json(
      { resources: rows.map((r) => `/resource/${encodeURIComponent(r.slug || String(r.id))}`) },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch {
    return NextResponse.json({ resources: [] }, { status: 200 });
  }
}
