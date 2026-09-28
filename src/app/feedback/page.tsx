'use client';
import React,{useState} from 'react';
import { MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export default function FeedbackPage(){
 const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [message,setMessage]=useState(''); const [sending,setSending]=useState(false); const [sent,setSent]=useState(false); const [error,setError]=useState('');
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setSending(true);setError('');try{const r=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,message})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not send feedback.');setSent(true);setMessage('');}catch(err){setError(err instanceof Error?err.message:'Could not send feedback.')}finally{setSending(false)}};
 return <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-7 sm:py-12">
   <section className="rounded-[1.75rem] border overflow-hidden" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
    <div className="p-6 sm:p-10" style={{background:'var(--accent-light)'}}><div className="w-11 h-11 rounded-xl grid place-items-center" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}><MessageCircle className="w-5 h-5"/></div><h1 className="font-display font-bold text-3xl sm:text-5xl mt-5">Tell us what could be better.</h1><p className="mt-3 text-sm sm:text-base leading-6 max-w-xl" style={{color:'var(--ink-muted)'}}>Found a broken link, a missing paper, a confusing screen, or just have an idea? Send it straight to the ARCHIVUM admin panel.</p></div>
    {sent?<div className="p-8 sm:p-12 text-center"><CheckCircle2 className="w-10 h-10 mx-auto" style={{color:'var(--accent)'}}/><h2 className="font-display font-bold text-2xl mt-4">Message received.</h2><p className="text-sm mt-2" style={{color:'var(--ink-muted)'}}>Thanks. Your feedback is now in the admin inbox.</p><button onClick={()=>setSent(false)} className="mt-6 rounded-xl px-5 py-3 text-xs font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>Send another</button></div>:<form onSubmit={submit} className="p-5 sm:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4"><label className="block"><span className="text-xs font-semibold">Name <span style={{color:'var(--ink-faint)'}}>(optional)</span></span><input value={name} onChange={e=>setName(e.target.value)} className="feedback-input mt-2" placeholder="What should we call you?" maxLength={80}/></label><label className="block"><span className="text-xs font-semibold">Email <span style={{color:'var(--ink-faint)'}}>(optional)</span></span><input value={email} onChange={e=>setEmail(e.target.value)} className="feedback-input mt-2" placeholder="If you want a reply" type="email" maxLength={160}/></label></div>
      <label className="block"><span className="text-xs font-semibold">Your message</span><textarea value={message} onChange={e=>setMessage(e.target.value)} className="feedback-input feedback-textarea mt-2" placeholder="Tell us what happened or what you would change…" required maxLength={2000}/></label>
      {error&&<p className="text-xs font-semibold" style={{color:'#b4233c'}}>{error}</p>}
      <button disabled={sending||message.trim().length<5} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold disabled:opacity-45" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>{sending?'Sending…':'Send feedback'}<Send className="w-3.5 h-3.5"/></button>
    </form>}
   </section>
 </main>
}
