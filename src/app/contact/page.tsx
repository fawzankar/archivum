'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ASend as Send, ACamera as Camera, AMail as Mail } from '@/components/AnimatedIcons';
import { useStudentClass } from '@/components/StudentClassContext';
import PageHead from '@/components/PageHead';

const KINDS = ['Concern', 'Suggestion', 'Missing material', 'Something else'];

export default function ContactPage() {
  const { studentClass, displayName } = useStudentClass();
  const [kind, setKind] = useState(KINDS[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (displayName) setName(displayName);
    if (studentClass) setClassLevel(String(studentClass));
  }, [displayName, studentClass]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSending(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', name.trim() || 'Anonymous'); fd.append('email', email.trim()); fd.append('classLevel', classLevel);
      fd.append('section', ''); fd.append('message', `[${kind}] ${message.trim()}`);
      const r = await fetch('/api/feedback', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Could not send your message.');
      setSent(true); setMessage('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not send your message.'); }
    finally { setSending(false); }
  };

  return <main className="ct">
    <PageHead title="Contact us" art="notes" tone="blush">Tell us what’s wrong, what’s missing, or what you’d like to see.</PageHead>
    <section className="contact-reach">
      <a className="contact-reach-card" href="https://instagram.com/quest_sjs" target="_blank" rel="noopener noreferrer"><span className="contact-reach-icon"><Camera /></span><div><strong><span className="quest-word">Quest</span> on Instagram</strong><p>Reach the <span className="quest-word">Quest</span> team for material, ideas or updates.</p><span className="contact-reach-link">@quest_sjs</span></div></a>
      <a className="contact-reach-card" href="mailto:sjsquest26@gmail.com"><span className="contact-reach-icon"><Mail /></span><div><strong>Email the <span className="quest-word">Quest</span> team</strong><p>Send us useful notes, papers or anything worth archiving.</p><span className="contact-reach-link">sjsquest26@gmail.com</span></div></a>
    </section>
    {sent
      ? <div className="ct-done"><CheckCircle2 /><h2>Message sent.</h2><p>The admin team will read it soon.</p><button type="button" onClick={() => setSent(false)}>Send Another</button></div>
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
        {error && <p className="ct-error" role="alert">{error}</p>}
        <button className="ct-send" disabled={sending || !classLevel}>{sending ? 'Sending…' : classLevel ? 'Send message' : 'Choose your class first'}<Send /></button>
      </form>}
  </main>;
}
