'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

function encodeKey(value: ArrayBuffer | null) {
  if (!value) return '';
  return btoa(String.fromCharCode(...new Uint8Array(value))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeKey(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function formatReminderHour(hour: number) {
  const twelveHour = hour % 12 || 12;
  return `${twelveHour} ${hour < 12 ? 'AM' : 'PM'}`;
}

export default function StudyReminderSettings() {
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(19);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('A gentle daily study reminder, sent at your local time.');

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistration().then(async (registration) => {
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) setEnabled(true);
    }).catch(() => {});
  }, []);

  const syncSubscription = async (subscription: PushSubscription, reminderHour: number) => {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: { p256dh: encodeKey(subscription.getKey('p256dh')), auth: encodeKey(subscription.getKey('auth')) },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        reminderHour,
      }),
    });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Could not save reminder settings.');
  };

  const enable = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setMessage('This browser does not support push reminders.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Allow notifications in your browser to turn reminders on.');
      const keyResponse = await fetch('/api/notifications/key', { cache: 'no-store' });
      const { publicKey, error } = await keyResponse.json();
      if (!keyResponse.ok || !publicKey) throw new Error(error || 'Study reminders are not configured yet.');
      const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      const readyRegistration = await navigator.serviceWorker.ready;
      const existing = await (readyRegistration || registration).pushManager.getSubscription();
      const subscription = existing || await (readyRegistration || registration).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeKey(publicKey),
      });
      await syncSubscription(subscription, hour);
      setEnabled(true);
      setMessage('Daily reminders are on.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not enable study reminders.');
    } finally { setSaving(false); }
  };

  const disable = async () => {
    setSaving(true);
    setMessage('');
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch('/api/notifications/subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: subscription.endpoint }) });
        await subscription.unsubscribe();
      }
      setEnabled(false);
      setMessage('Daily reminders are off.');
    } catch { setMessage('Could not turn reminders off.'); }
    finally { setSaving(false); }
  };

  const changeHour = async (value: number) => {
    setHour(value);
    if (!enabled) return;
    setSaving(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) await syncSubscription(subscription, value);
      setMessage(`Reminder time set to ${formatReminderHour(value)}.`);
    } catch { setMessage('Could not update the reminder time.'); }
    finally { setSaving(false); }
  };

  return (
    <section className="study-reminder-settings" aria-label="Study reminders">
      <div className="study-reminder-copy"><Bell aria-hidden="true" /><div><strong>Study reminders</strong><span>One gentle reminder each day</span></div></div>
      <label className="study-reminder-time">Send at
        <select value={hour} onChange={(event) => void changeHour(Number(event.target.value))} disabled={saving} aria-label="Daily reminder time">
          {Array.from({ length: 24 }, (_, value) => <option key={value} value={value}>{formatReminderHour(value)}</option>)}
        </select>
      </label>
      <button type="button" onClick={enabled ? disable : enable} disabled={saving} className="study-reminder-toggle">
        {enabled ? <><BellOff /> Turn off</> : <><Bell /> {saving ? 'Setting up…' : 'Turn on'}</>}
      </button>
      <p aria-live="polite">{message}</p>
    </section>
  );
}
