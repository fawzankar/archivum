'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Search } from 'lucide-react';
import { addRecentSearch, clearRecentSearches, getRecentSearches } from '@/lib/studyStats';

export default function SearchBar({ className = '', initialValue = '', onSearch, autoFocus = false, showRecent = false }: { className?: string; initialValue?: string; onSearch?: () => void; autoFocus?: boolean; showRecent?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => { if (showRecent) setRecent(getRecentSearches()); }, [showRecent]);

  const go = (value: string) => {
    const q = value.trim();
    if (q) addRecentSearch(q);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    onSearch?.();
  };

  const submit = (event: React.FormEvent) => { event.preventDefault(); go(query); };

  return <>
    <form className={`clean-search ${className}`.trim()} onSubmit={submit} role="search">
      <Search aria-hidden="true" />
      <input value={query} onChange={event => setQuery(event.target.value)} aria-label="Search ARCHIVUM" placeholder="Try “Newton’s laws” or “Class 10 maths”" autoComplete="off" autoFocus={autoFocus} />
      <button type="submit" aria-label="Search"><ArrowRight /></button>
    </form>
    {showRecent && recent.length > 0 && (
      <div className="rs">
        <div className="rs-head"><span>Searched recently</span><button type="button" onClick={() => { clearRecentSearches(); setRecent([]); }}>Clear</button></div>
        <div className="rs-row">
          {recent.map(item => <button key={item} type="button" className="rs-chip" onClick={() => go(item)}><Clock aria-hidden="true" />{item}</button>)}
        </div>
      </div>
    )}
  </>;
}
