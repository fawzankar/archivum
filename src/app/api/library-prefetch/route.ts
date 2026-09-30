import { NextResponse } from 'next/server';
import { getLibraryItems } from '@/lib/resources';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = Number(url.searchParams.get('class') || '');
  const classLevel = [9, 10, 11, 12].includes(requested) ? requested : 10;

  try {
    const [notes, papers] = await Promise.all([
      getLibraryItems('Notes', classLevel),
      getLibraryItems('Previous Year Paper', classLevel),
    ]);

    return NextResponse.json({
      notes: { [classLevel]: notes },
      papers: { [classLevel]: papers },
      version: 2,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch {
    return NextResponse.json({
      notes: { [classLevel]: [] },
      papers: { [classLevel]: [] },
      version: 2,
    });
  }
}
