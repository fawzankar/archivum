'use client';
import React, { useRef, useState } from 'react';
import { Send, CheckCircle2, Paperclip } from 'lucide-react';
import { useStudentClass } from '@/components/StudentClassContext';
import PageHead from '@/components/PageHead';

const KINDS = ['Concern', 'Suggestion', 'Missing material', 'Something else'];

export default function ContactPage() {
  const { studentClass, displayName } = useStudentClass();
  const [kind, setKind] = useState(KINDS[0]);
  const [name, setName] = useState(displayName);
  const [email, setEmail] = useState('');
  const [classLevel, setClassLevel] = useState(studentClass ? String(studentClass) : '');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSending(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', name.trim() || 'Anonymous'); fd.append('email', email.trim()); fd.append('classLevel', classLevel);
      fd.append('section', ''); fd.append('message', `[${kind}] ${message.trim()}`);
      files.slice(0, 6).forEach(f => fd.append('attachments', f));
      const r = await fetch('/api/feedback', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Could not send your message.');
      setSent(true); setMessage(''); setFiles([]);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not send your message.'); }
    finally { setSending(false); }
  };

  return <main className="ct">
    <PageHead title="Contact us" art="notes" tone="blush">Tell us what’s wrong, what’s missing, or what you’d like to see.</PageHead>
    {sent
      ? <div className="ct-done"><CheckCircle2 /><h2>Message sent.</h2><p>The admin team will read it soon.</p><button type="button" onClick={() => setSent(false)}>Send another</button></div>
      : <form className="ct-form" onSubmit={submit}>
        <fieldset><legend>What is this about?</legend>
          <div className="ct-chips">{KINDS.map(k => <button type="button" key={k} className={kind === k ? 'on' : ''} aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>)}</div>
        </fieldset>
        <fieldset><legend>Your class</legend>
          <div className="ct-chips">{[9, 10, 11, 12].map(c => <button type="button" key={c} className={classLevel === String(c) ? 'on' : ''} aria-pressed={classLevel === String(c)} onClick={() => setClassLevel(String(c))}>Class {c}</button>)}</div>
        </fieldset>
        <label>Name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={80} autoComplete="name" /></label>
        <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" maxLength={160} autoComplete="email" inputMode="email" /></label>
        <label>Message<textarea required rows={6} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write it here" maxLength={3000} /></label>
        <div className="ct-attach"><button type="button" onClick={() => fileRef.current?.click()}><Paperclip /> Add screenshots</button><input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" multiple hidden onChange={e => setFiles(Array.from(e.target.files || []).slice(0, 6))} /><span>{files.length ? files.map(f => f.name).join(', ') : 'Optional, up to 6 files'}</span></div>
        {error && <p className="ct-error" role="alert">{error}</p>}
        <button className="ct-send" disabled={sending || !classLevel}>{sending ? 'Sending…' : classLevel ? 'Send message' : 'Choose your class first'}<Send /></button>
      </form>}
  </main>;
}
