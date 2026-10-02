import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return NextResponse.json({ error: 'Study reminders are not configured yet.' }, { status: 503 });
  return NextResponse.json({ publicKey }, { headers: { 'Cache-Control': 'no-store' } });
}
