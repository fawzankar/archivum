use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';

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

  return (
    <div>
      <form onSubmit={submit} className="group flex items-center border-b-2 py-3 transition-colors" style={{borderColor:'var(--ink)'}}>
        <Search className="w-5 h-5 mr-3 shrink-0" style={{color:'var(--ink-muted)'}} />
        <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the archive…" className="min-w-0 flex-1 bg-transparent outline-none text-sm sm:text-base" />
        <kbd className="hidden sm:block text-[10px] px-2 py-1 border font-medium" style={{borderColor:'var(--border)',color:'var(--ink-faint)'}}>⌘ K</kbd>
        <button aria-label="Search" className="ml-3 w-8 h-8 flex items-center justify-center transition-transform group-focus-within:translate-x-0.5" style={{color:'var(--accent)'}}><ArrowRight className="w-4 h-4"/></button>
      </form>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-[10px] sm:text-[11px]" style={{color:'var(--ink-muted)'}}>
        <span style={{color:'var(--ink-faint)'}}>Try</span>
        {['class 10 science','chemical reactions','previous papers'].map(term => (
          <button key={term} type="button" onClick={()=>router.push(`/search?q=${encodeURIComponent(term)}`)} className="hover:text-[var(--accent)] transition-colors">{term}</button>
        ))}
      </div>
    </div>
  );
}
