'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
export default function HomeClient({ initialSearch = '' }: { initialSearch?: string }) {
  const [query,setQuery]=useState(initialSearch); const router=useRouter(); const inputRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{ const onKey=(e:KeyboardEvent)=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();inputRef.current?.focus();}}; window.addEventListener('keydown',onKey); return()=>window.removeEventListener('keydown',onKey);},[]);
  return <form className="clean-search" onSubmit={e=>{e.preventDefault();router.push(query.trim()?`/search?q=${encodeURIComponent(query.trim())}`:'/search')}}>
    <Search/><input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search notes, papers or topics" aria-label="Search the archive"/><button aria-label="Search"><ArrowRight/></button>
  </form>;
}
