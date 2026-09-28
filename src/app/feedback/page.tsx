'use client';
import React,{useRef,useState} from 'react';
import { MessageCircle, Send, CheckCircle2, Paperclip } from 'lucide-react';
import { useStudentClass } from '@/components/StudentClassContext';

export default function FeedbackPage(){
 const { studentClass, displayName } = useStudentClass();
 const [name,setName]=useState(displayName); const [email,setEmail]=useState(''); const [classLevel,setClassLevel]=useState(String(studentClass||'')); const [section,setSection]=useState(''); const [message,setMessage]=useState(''); const [files,setFiles]=useState<File[]>([]); const [sending,setSending]=useState(false); const [sent,setSent]=useState(false); const [error,setError]=useState(''); const fileRef=useRef<HTMLInputElement>(null);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setSending(true);setError('');try{const fd=new FormData();fd.append('name',name.trim());fd.append('email',email.trim());fd.append('classLevel',classLevel);fd.append('section',section.trim());fd.append('message',message.trim());files.slice(0,6).forEach(file=>fd.append('attachments',file));const r=await fetch('/api/feedback',{method:'POST',body:fd});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not send feedback.');setSent(true);setMessage('');setFiles([]);}catch(err){setError(err instanceof Error?err.message:'Could not send feedback.')}finally{setSending(false)}};
 return <main className="feedback-page archive-shell">
  <section className="feedback-card">
   <div className="feedback-intro"><div className="feedback-icon"><MessageCircle/></div><h1>Tell us what needs fixing.</h1><p>Found a glitch, missing chapter, wrong file, or want something added? Send it here and it goes to the admin inbox.</p></div>
   {sent?<div className="feedback-success"><CheckCircle2/><h2>Got it.</h2><p>Your message is with the admin team.</p><button onClick={()=>setSent(false)}>Send another</button></div>:<form onSubmit={submit} className="feedback-form">
    <div className="feedback-grid"><label>Name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" maxLength={80}/></label><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" maxLength={160}/></label><label>Class<select required value={classLevel} onChange={e=>setClassLevel(e.target.value)}><option value="">Choose class</option>{[9,10,11,12].map(c=><option key={c}>{c}</option>)}</select></label><label>Section<input required value={section} onChange={e=>setSection(e.target.value)} placeholder="A, B, C…" maxLength={20}/></label></div>
    <label>Message<textarea required value={message} onChange={e=>setMessage(e.target.value)} placeholder="What happened, or what should we add?" maxLength={3000}/></label>
    <div className="feedback-attach"><button type="button" onClick={()=>fileRef.current?.click()}><Paperclip/> Add files</button><input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" multiple hidden onChange={e=>setFiles(Array.from(e.target.files||[]).slice(0,6))}/><span>{files.length?files.map(f=>f.name).join(', '):'Up to 6 screenshots or PDFs'}</span></div>
    {error&&<p className="feedback-error">{error}</p>}
    <button className="feedback-submit" disabled={sending}>{sending?'Sending…':'Send feedback'}<Send/></button>
   </form>}
  </section>
 </main>
}
