'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { BellRing, Send } from 'lucide-react';
import { useToast } from './ToastContext';

export default function AdminNotificationComposer() {
  const { showToast } = useToast();
  const [title, setTitle] = useState('ARCHIVUM update');
  const [message, setMessage] = useState('');
  const [subscribers, setSubscribers] = useState<number | null>(null);
  const [configured, setConfigured] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/notifications').then((response) => response.ok ? response.json() : null).then((data) => {
      if (data) { setSubscribers(Number(data.subscribers || 0)); setConfigured(Boolean(data.configured)); }
    }).catch(() => {});
  }, []);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, message }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not send the notification.');
      showToast(`Notification sent to ${result.sent} students.`);
      setMessage('');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Could not send the notification.', 'error'); }
    finally { setSending(false); }
  };

  return (
    <section className="admin-notification-panel space-y-5">
      <div><h2 className="font-display font-bold text-2xl">Share a Notification</h2><p className="mt-1 text-sm" style={{ color: 'var(--ink-muted)' }}>Send a short message to students who have enabled reminders.</p></div>
      <div className="rounded-2xl border p-4 text-sm" style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 font-semibold"><BellRing className="h-4 w-4" style={{ color: 'var(--accent)' }} />{subscribers === null ? 'Checking subscriptions…' : `${subscribers} subscribed device${subscribers === 1 ? '' : 's'}`}</div>
        {!configured && <p className="mt-2 text-xs" style={{ color: 'var(--ink-muted)' }}>Push delivery is not configured yet. Add the VAPID keys and CRON_SECRET to the deployment environment.</p>}
      </div>
      <form onSubmit={send} className="grid gap-4 rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <label className="grid gap-1.5 text-xs font-semibold">Notification title
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} required className="rounded-xl border px-3 py-2.5 text-sm font-normal" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }} />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold">Message
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={280} rows={4} required placeholder="Write the notification students will receive…" className="resize-y rounded-xl border px-3 py-2.5 text-sm font-normal" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }} />
          <span className="text-right text-[10px] font-normal" style={{ color: 'var(--ink-faint)' }}>{message.length}/280</span>
        </label>
        <button disabled={sending || !configured || subscribers === 0} className="inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold disabled:opacity-50" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}>
          <Send className="h-3.5 w-3.5" />{sending ? 'Sending…' : 'Send Notification'}
        </button>
      </form>
    </section>
  );
}
