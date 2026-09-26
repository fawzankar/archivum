import { NextResponse } from 'next/server';
import { createReview, getApprovedReviews } from '@/lib/reviews';
import { initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDb();
    return NextResponse.json({ reviews: await getApprovedReviews(6) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not load reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
    const review = typeof body.review === 'string' ? body.review.trim().slice(0, 800) : '';
    const rating = Number(body.rating);

    if (!name || name.length < 2 || !review || review.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Please provide your name, a 1–5 star rating, and a review of at least 10 characters.' }, { status: 400 });
    }

    await createReview(name, rating, review);
    return NextResponse.json({ success: true, message: 'Thanks — your review was submitted for moderation.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not submit review' }, { status: 500 });
  }
}
