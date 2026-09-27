import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'This upload endpoint has moved to Cloudflare R2. Use /api/r2-upload.' },
    { status: 410 }
  );
}
