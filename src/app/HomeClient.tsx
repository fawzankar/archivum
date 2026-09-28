'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HomeClient({ initialSearch = '' }: { initialSearch?: string }) {
  const [query, setQuery] = useState(initialSearch);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
  };
  const quick = (term: string) => { setQuery(term); router.push(`/search?q=${encodeURIComponent(term)}`); };

  return <div className="home-search-form">
    <form onSubmit={submit}>
      <div className="home-search-box">
        <Search className="ml-4 w-4 h-4 shrink-0" style={{ color:'var(--gold)' }} />
        <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the archive — notes, papers, subjects…" className="min-w-0 flex-1 bg-transparent outline-none px-3 py-4 text-sm" aria-label="Search the archive" />
        <span className="search-hint hidden sm:inline-flex px-4 py-1.5 text-[9px] font-semibold tracking-[.12em]">CTRL K</span>
      </div>
    </form>
    <div className="quick-searches flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-[10px]">
      <span>TRY</span>
      <button type="button" onClick={()=>quick('class 10 science')}>class 10 science</button><span>·</span>
      <button type="button" onClick={()=>quick('chemical reactions')}>chemical reactions</button><span>·</span>
      <button type="button" onClick={()=>quick('previous papers')}>previous papers</button>
    </div>
  </div>;
}
