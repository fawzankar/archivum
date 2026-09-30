import { NextResponse } from 'next/server';
import { getLibraryBundle } from '@/lib/resources';

export const runtime = 'nodejs';
export const revalidate = 300;

// Whole Notes + Papers library in one response. The browser stores it, so this is only hit
// to refresh stale data (and is served by the service worker cache first).
export async function GET() {
  try {
    const bundle = await getLibraryBundle();
    return NextResponse.json(bundle, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
