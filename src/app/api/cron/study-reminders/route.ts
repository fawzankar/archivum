import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { configureWebPush, webpush } from '@/lib/webPush';
export const dynamic = 'force-dynamic';

type Subscription = { endpoint: string; p256dh: string; auth: string; timezone: string; reminder_hour: number; last_reminder_date: string | null };

function localTime(timezone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour) };
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET is not configured.' }, { status: 503 });
  if (request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!configureWebPush()) return NextResponse.json({ error: 'VAPID keys are not configured.' }, { status: 503 });
  const subscriptions = await query<Subscription>('SELECT endpoint,p256dh,auth,timezone,reminder_hour,last_reminder_date FROM push_subscriptions');
  let sent = 0;
  let removed = 0;
  for (const subscription of subscriptions) {
    try {
      let now: { date: string; hour: number };
      try { now = localTime(subscription.timezone || 'UTC'); }
      catch { now = localTime('UTC'); }
      if (now.hour !== Number(subscription.reminder_hour) || subscription.last_reminder_date === now.date) continue;
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify({
        title: 'A gentle study reminder', body: 'Take a few minutes to revise something today. You have this.', url: '/', tag: `archivum-study-${now.date}`,
      }));
      await execute('UPDATE push_subscriptions SET last_reminder_date=? WHERE endpoint=?', [now.date, subscription.endpoint]);
      sent += 1;
    } catch (error: any) {
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await execute('DELETE FROM push_subscriptions WHERE endpoint=?', [subscription.endpoint]);
        removed += 1;
      }
    }
  }
  return NextResponse.json({ success: true, sent, removed, checked: subscriptions.length });
}
