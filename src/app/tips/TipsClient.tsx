'use client';

import React, { useMemo, useState } from 'react';
import { Check, Lightbulb, RefreshCw, Send, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import type { Tip } from '@/lib/tips';
import { subjectsForClass } from '@/lib/subjects';

export default function TipsClient({initialTips,initialClass}:{initialTips:Tip[];initialClass:number}){
 const [tips,setTips]=useState(initialTips);
 const [classLevel,setClassLevel]=useState(initialClass);
 const [subject,setSubject]=useState('All');
 const [title,setTitle]=useState('');
 const [body,setBody]=useState('');
 const [author,setAuthor]=useState('');
 const [status,setStatus]=useState('');
 const [sending,setSending]=useState(false);

 const loadTips=async(level:number, nextSubject='All')=>{
   const query=`/api/tips?class=${level}${nextSubject!=='All'?`&subject=${encodeURIComponent(nextSubject)}`:''}`;
   const r=await fetch(query);
   if(r.ok){const j=await r.json();setTips(j.tips||[]);}
 };
 const shuffled=useMemo(()=>[...tips], [tips]);

 const submit=async(e:React.FormEvent)=>{
   e.preventDefault(); setSending(true); setStatus('');
   try{
     const r=await fetch('/api/tips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({class_level:classLevel,subject:subject==='All'?subjectsForClass(classLevel)[0]:subject,title,body,author})});
     const j=await r.json(); if(!r.ok) throw new Error(j.error);
     setTitle('');setBody('');setAuthor('');setStatus('Submitted — a moderator will review it before publishing.');
   }catch(e){setStatus(e instanceof Error?e.message:'Could not submit tip.')}finally{setSending(false)}
 };

 return <div className="space-y-8 sm:space-y-10">
   <section className="rounded-[2rem] border overflow-hidden premium-shadow" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
     <div className="p-6 sm:p-8" style={{background:'linear-gradient(135deg,var(--accent-light),var(--surface))'}}>
       <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
         <div><span className="text-[10px] font-bold uppercase tracking-[.2em]" style={{color:'var(--accent)'}}>PERSONALISED EXAM PLAYBOOK</span><h2 className="font-display font-bold text-2xl sm:text-3xl mt-2">Practical advice for Class {classLevel}.</h2><p className="text-xs sm:text-sm mt-2 max-w-2xl" style={{color:'var(--ink-muted)'}}>Shuffle through concise study techniques, answer-writing habits and revision moves. General tips stay visible alongside subject-specific advice.</p></div>
         <button onClick={()=>loadTips(classLevel,subject)} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition-transform hover:scale-105" style={{borderColor:'var(--border)',background:'var(--surface)'}}><RefreshCw className="w-3.5 h-3.5"/> New tips</button>
       </div>
     </div>
     <div className="p-4 sm:p-6 border-t space-y-4" style={{borderColor:'var(--border-light)'}}>
       <div className="flex gap-2 overflow-x-auto no-scrollbar">
         {[9,10,11,12].map(level=><button key={level} onClick={()=>{setClassLevel(level);setSubject('All');loadTips(level,'All')}} className="shrink-0 px-4 py-2 rounded-full text-[11px] font-bold border transition-all" style={{borderColor:level===classLevel?'var(--accent)':'var(--border)',background:level===classLevel?'var(--accent-light)':'var(--surface)',color:level===classLevel?'var(--accent)':'var(--ink-muted)'}}>Class {level}</button>)}
       </div>
       <div className="flex gap-2 overflow-x-auto no-scrollbar">
         <button onClick={()=>{setSubject('All');loadTips(classLevel,'All')}} className="shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-bold" style={{background:subject==='All'?'var(--accent)':'var(--surface-raised)',color:subject==='All'?'var(--accent-contrast)':'var(--ink-muted)'}}>All subjects</button>
         {subjectsForClass(classLevel).map(s=><button key={s} onClick={()=>{setSubject(s);loadTips(classLevel,s)}} className="shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-bold border" style={{borderColor:subject===s?'var(--accent)':'var(--border)',background:subject===s?'var(--accent-light)':'var(--surface)',color:subject===s?'var(--accent)':'var(--ink-muted)'}}>{s}</button>)}
       </div>
     </div>
   </section>

   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
     {shuffled.slice(0,9).map((tip,i)=><article key={tip.id} className="group rounded-[1.75rem] border p-5 sm:p-6 min-h-[210px] relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl animate-fade" style={{background:'var(--surface)',borderColor:'var(--border)',animationDelay:`${i*45}ms`}}>
       <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full transition-transform duration-700 group-hover:scale-125" style={{background:'var(--accent-light)'}}/>
       <div className="relative h-full flex flex-col">
         <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.16em]" style={{color:'var(--accent)'}}>{tip.subject==='General'?'EXAM TIP':tip.subject}</span><span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'var(--accent-light)',color:'var(--accent)'}}><Lightbulb className="w-4 h-4"/></span></div>
         <h3 className="font-display font-bold text-lg mt-6 leading-snug">{tip.title}</h3>
         <p className="text-sm leading-relaxed mt-2" style={{color:'var(--ink-muted)'}}>{tip.body}</p>
         <div className="mt-auto pt-5 flex items-center justify-between"><span className="text-[10px] font-semibold" style={{color:'var(--ink-faint)'}}>— {tip.author||'SJS student'}</span><ShieldCheck className="w-4 h-4" style={{color:'var(--accent)'}}/></div>
       </div>
     </article>)}
   </div>

   <section className="rounded-[2rem] p-6 sm:p-9 overflow-hidden relative" style={{background:'var(--accent)',color:'var(--accent-contrast)',boxShadow:'0 25px 70px var(--accent-glow)'}}>
     <Sparkles className="absolute -right-4 -top-4 w-32 h-32 opacity-10"/>
     <div className="relative max-w-3xl">
       <span className="text-[10px] font-bold uppercase tracking-[.2em] opacity-70">COMMUNITY PLAYBOOK</span>
       <h2 className="font-display font-bold text-2xl sm:text-3xl mt-2">Have a useful exam trick?</h2>
       <p className="text-xs sm:text-sm mt-2 opacity-80">Choose the class and subject, add your name, and share one practical tip. Every submission is moderated.</p>
       <form onSubmit={submit} className="mt-7 space-y-3">
         <div className="grid sm:grid-cols-3 gap-3">
           <select value={classLevel} onChange={e=>{const level=Number(e.target.value);setClassLevel(level);setSubject('All')}} className="rounded-2xl px-3.5 py-3 text-xs outline-none" style={{background:'var(--surface)',color:'var(--ink)'}}>{[9,10,11,12].map(n=><option key={n} value={n}>Class {n}</option>)}</select>
           <select value={subject==='All'?subjectsForClass(classLevel)[0]:subject} onChange={e=>setSubject(e.target.value)} className="rounded-2xl px-3.5 py-3 text-xs outline-none" style={{background:'var(--surface)',color:'var(--ink)'}}>{subjectsForClass(classLevel).map(s=><option key={s} value={s}>{s}</option>)}</select>
           <input value={author} onChange={e=>setAuthor(e.target.value)} maxLength={80} placeholder="Your name" required className="rounded-2xl px-3.5 py-3 text-xs outline-none" style={{background:'var(--surface)',color:'var(--ink)'}}/>
         </div>
         <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} placeholder="Tip title" required className="w-full rounded-2xl px-3.5 py-3 text-xs outline-none" style={{background:'var(--surface)',color:'var(--ink)'}}/>
         <textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={600} minLength={15} rows={4} placeholder="Write one clear, useful tip…" required className="w-full rounded-2xl px-3.5 py-3 text-xs outline-none resize-none" style={{background:'var(--surface)',color:'var(--ink)'}}/>
         <div className="flex flex-col sm:flex-row gap-3 sm:items-center"><button disabled={sending} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-bold" style={{background:'var(--surface)',color:'var(--ink)'}}><Send className="w-3.5 h-3.5"/>{sending?'Submitting…':'Submit tip'}</button><span className="text-[10px] opacity-70 flex items-center gap-1"><Check className="w-3 h-3"/> Class + subject + author required</span></div>
         {status&&<p className="text-xs mt-2 opacity-90">{status}</p>}
       </form>
     </div>
   </section>
 </div>;
}
