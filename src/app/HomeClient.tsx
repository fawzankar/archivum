'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Search } from 'lucide-react';

export default function HomeClient({ initialSearch = '' }: { initialSearch?: string }) {
  const [query, setQuery] = useState(initialSearch);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inputRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <form className="archive-search" onSubmit={e => { e.preventDefault(); router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search'); }}>
      <Search /><input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the archive" aria-label="Search the archive" />
      <kbd>⌘ K</kbd><button aria-label="Search"><ArrowUpRight /></button>
    </form>
  );
}
