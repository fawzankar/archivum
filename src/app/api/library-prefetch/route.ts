import { NextResponse } from 'next/server';
import { getResources } from '@/lib/resources';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = Number(url.searchParams.get('class') || '');
  const classLevel = [9, 10, 11, 12].includes(requested) ? requested : 10;

  try {
    const [notes, papers] = await Promise.all([
      getResources({ resource_type: 'Notes', class_level: classLevel, limit: 200, withCount: false }),
      getResources({ resource_type: 'Previous Year Paper', class_level: classLevel, limit: 200, withCount: false }),
    ]);

    return NextResponse.json({
      notes: { [classLevel]: notes.items },
      papers: { [classLevel]: papers.items },
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
