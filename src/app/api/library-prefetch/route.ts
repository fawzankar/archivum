import { NextResponse } from 'next/server';
import { getLibraryBundle } from '@/lib/resources';

export const runtime = 'nodejs';
export const revalidate = 300;

// Legacy per-class endpoint (kept for older cached clients). Backed by the same bundle.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = Number(url.searchParams.get('class') || '');
  const classLevel = [9, 10, 11, 12].includes(requested) ? requested : 10;
  try {
    const bundle = await getLibraryBundle();
    return NextResponse.json(
      { notes: { [classLevel]: bundle.notes[classLevel] || [] }, papers: { [classLevel]: bundle.papers[classLevel] || [] }, version: 2 },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  } catch {
    return NextResponse.json({ notes: { [classLevel]: [] }, papers: { [classLevel]: [] }, version: 2 });
  }
}
