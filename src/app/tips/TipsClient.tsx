'use client';

import React, { useState } from 'react';
import { RefreshCw, Send, ShieldCheck, Clock3 } from 'lucide-react';
import type { Tip } from '@/lib/tips';
import { subjectsForClass } from '@/lib/subjects';

export default function TipsClient({ initialTips, initialClass }: { initialTips: Tip[]; initialClass: number }) {
  const [tips, setTips] = useState(initialTips);
  const [classLevel, setClassLevel] = useState(initialClass);
  const [subject, setSubject] = useState('All');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const loadTips = async (level:number, nextSubject='All') => {
    const url = `/api/tips?class=${level}${nextSubject !== 'All' ? `&subject=${encodeURIComponent(nextSubject)}` : ''}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      setTips(data.tips || []);
    }
  };

  const formatDate = (value:string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString(undefined, {day:'numeric', month:'short', year:'numeric'});
  };

  const submit = async (event:React.FormEvent) => {
    event.preventDefault();
    setSending(true); setStatus('');
    try {
      const response = await fetch('/api/tips', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          class_level:classLevel,
          subject:subject === 'All' ? subjectsForClass(classLevel)[0] : subject,
          title, body, author
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTitle(''); setBody(''); setAuthor('');
      setStatus('Your tip was submitted for review.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not submit the tip.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b" style={{borderColor:'var(--border)'}}>
          <div>
            <h2 className="text-2xl font-semibold">Tips for Class {classLevel}</h2>
            <p className="text-sm mt-2 max-w-2xl" style={{color:'var(--ink-muted)'}}>Choose a class and subject to read short, practical advice from the SJS community.</p>
          </div>
          <button onClick={() => loadTips(classLevel, subject)} className="btn btn-secondary shrink-0"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-4 border-b" style={{borderColor:'var(--border-light)'}}>
          {[9,10,11,12].map(level => (
            <button key={level} onClick={() => {setClassLevel(level);setSubject('All');loadTips(level,'All')}} className="btn shrink-0" style={{borderColor:level===classLevel?'var(--accent)':'var(--border)',background:level===classLevel?'var(--accent-light)':'var(--surface)',color:level===classLevel?'var(--accent)':'var(--ink)'}}>Class {level}</button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-3">
          {['All', ...subjectsForClass(classLevel)].map(item => (
            <button key={item} onClick={() => {setSubject(item);loadTips(classLevel,item)}} className="btn shrink-0" style={{borderColor:item===subject?'var(--accent)':'var(--border)',background:item===subject?'var(--accent)':'var(--surface)',color:item===subject?'var(--accent-contrast)':'var(--ink)'}}>
              {item === 'All' ? 'All subjects' : item}
            </button>
          ))}
        </div>
      </section>

      {tips.length ? (
        <div className="divide-y" style={{borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
          {tips.slice(0,12).map(tip => (
            <article key={tip.id} className="py-6 grid md:grid-cols-[180px_1fr] gap-5">
              <div>
                <div className="text-sm font-medium" style={{color:'var(--accent)'}}>{tip.subject}</div>
                <div className="text-xs mt-1 inline-flex items-center gap-1" style={{color:'var(--ink-faint)'}}><Clock3 className="w-3 h-3" /> {formatDate(tip.created_at)}</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{tip.title}</h3>
                <p className="text-sm leading-6 mt-2 max-w-2xl" style={{color:'var(--ink-muted)'}}>{tip.body}</p>
                <div className="text-xs mt-4" style={{color:'var(--ink-faint)'}}>Shared by {tip.author || 'an SJS student'}</div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="archive-surface p-8">
          <h3 className="text-lg font-semibold">No published tips for this selection yet.</h3>
          <p className="text-sm mt-2" style={{color:'var(--ink-muted)'}}>You can submit one below.</p>
        </div>
      )}

      <section className="pt-4 border-t" style={{borderColor:'var(--border)'}}>
        <h2 className="text-2xl font-semibold">Share something that helped you.</h2>
        <p className="text-sm mt-2 max-w-2xl" style={{color:'var(--ink-muted)'}}>Keep it specific and useful. Every tip is reviewed before it appears in the archive.</p>
        <form onSubmit={submit} className="mt-6 space-y-3 max-w-3xl">
          <div className="grid sm:grid-cols-3 gap-3">
            <select value={classLevel} onChange={e => {setClassLevel(Number(e.target.value));setSubject('All')}} className="form-control">
              {[9,10,11,12].map(n => <option key={n} value={n}>Class {n}</option>)}
            </select>
            <select value={subject === 'All' ? subjectsForClass(classLevel)[0] : subject} onChange={e => setSubject(e.target.value)} className="form-control">
              {subjectsForClass(classLevel).map(s => <option key={s}>{s}</option>)}
            </select>
            <input value={author} onChange={e => setAuthor(e.target.value)} maxLength={80} placeholder="Your name" required className="form-control" />
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} placeholder="Give the tip a clear title" required className="form-control" />
          <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={600} minLength={15} rows={5} placeholder="Write the tip in a few clear sentences." required className="form-control resize-none" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button disabled={sending} className="btn btn-primary"><Send className="w-4 h-4" />{sending ? 'Submitting…' : 'Submit tip'}</button>
            <span className="text-xs inline-flex items-center gap-1" style={{color:'var(--ink-muted)'}}><ShieldCheck className="w-3.5 h-3.5" /> Reviewed before publication</span>
          </div>
          {status && <p className="text-sm" style={{color:'var(--accent)'}}>{status}</p>}
        </form>
      </section>
    </div>
  );
}
