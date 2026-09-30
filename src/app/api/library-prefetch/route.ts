import { NextResponse } from 'next/server';
import { getResources } from '@/lib/resources';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET() {
  try {
    const classes = [9, 10, 11, 12] as const;
    const [notes, papers] = await Promise.all([
      Promise.all(classes.map((class_level) =>
        getResources({ resource_type: 'Notes', class_level, limit: 200, withCount: false })
      )),
      Promise.all(classes.map((class_level) =>
        getResources({ resource_type: 'Previous Year Paper', class_level, limit: 200, withCount: false })
      )),
    ]);

    const payload = {
      notes: Object.fromEntries(classes.map((c, i) => [c, notes[i].items])),
      papers: Object.fromEntries(classes.map((c, i) => [c, papers[i].items])),
      version: 1,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch {
    return NextResponse.json({ notes: {}, papers: {}, version: 1 }, { status: 200 });
  }
}
