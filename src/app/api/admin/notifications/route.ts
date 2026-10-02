import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { configureWebPush, webpush } from '@/lib/webPush';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await queryOne<{ count: number }>('SELECT COUNT(*) AS count FROM push_subscriptions');
  return NextResponse.json({ subscribers: Number(result?.count || 0), configured: Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!configureWebPush()) return NextResponse.json({ error: 'Configure VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY first.' }, { status: 503 });
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 80) : '';
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 280) : '';
    if (!title || !message) return NextResponse.json({ error: 'Add a title and notification text.' }, { status: 400 });
    const { query, execute } = await import('@/lib/db');
    const subscriptions = await query<{ endpoint: string; p256dh: string; auth: string }>('SELECT endpoint,p256dh,auth FROM push_subscriptions');
    let sent = 0;
    let removed = 0;
    await Promise.all(subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify({ title, body: message, url: '/' }));
        sent += 1;
      } catch (error: any) {
        if (error?.statusCode === 404 || error?.statusCode === 410) { await execute('DELETE FROM push_subscriptions WHERE endpoint=?', [subscription.endpoint]); removed += 1; }
      }
    }));
    return NextResponse.json({ success: true, sent, removed, subscribers: subscriptions.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not send the notification.' }, { status: 500 });
  }
}
