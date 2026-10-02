import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const endpoint = typeof body.endpoint === 'string' ? body.endpoint : '';
    const p256dh = typeof body.keys?.p256dh === 'string' ? body.keys.p256dh : '';
    const auth = typeof body.keys?.auth === 'string' ? body.keys.auth : '';
    const timezone = typeof body.timezone === 'string' && body.timezone.length <= 80 ? body.timezone : 'UTC';
    const reminderHour = Number(body.reminderHour);
    if (!endpoint.startsWith('https://') || endpoint.length > 2048 || !p256dh || !auth || !Number.isInteger(reminderHour) || reminderHour < 0 || reminderHour > 23) {
      return NextResponse.json({ error: 'Invalid push subscription.' }, { status: 400 });
    }
    await execute(`INSERT INTO push_subscriptions (endpoint,p256dh,auth,timezone,reminder_hour,created_at)
      VALUES (?,?,?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh,auth=excluded.auth,timezone=excluded.timezone,reminder_hour=excluded.reminder_hour`,
      [endpoint,p256dh,auth,timezone,reminderHour,new Date().toISOString()]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save the subscription.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const endpoint = typeof body.endpoint === 'string' ? body.endpoint : '';
    if (!endpoint.startsWith('https://') || endpoint.length > 2048) return NextResponse.json({ error: 'Invalid push subscription.' }, { status: 400 });
    await execute('DELETE FROM push_subscriptions WHERE endpoint=?', [endpoint]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Could not remove the subscription.' }, { status: 500 });
  }
}
