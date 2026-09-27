'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HomeClient({ initialSearch = '' }: { initialSearch?: string }) {
  const [query, setQuery] = useState(initialSearch);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = query.trim();
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : '/search');
  };

  const quickSearches = ['Class 10 Science', 'Chemical reactions', 'Previous papers'];

  return (
    <div className="home-search">
      <form onSubmit={handleSearch} className="home-search__box">
        <Search className="w-5 h-5 ml-4 shrink-0" style={{color:'var(--ink-muted)'}} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search the archive by subject, chapter or paper"
          aria-label="Search the ARCHIVUM archive"
        />
        <button type="submit" className="btn btn-primary mr-1.5">
          Search
        </button>
      </form>
      <div className="home-search__hint">
        Try: {quickSearches.map((term, index) => (
          <React.Fragment key={term}>
            {index > 0 && <span className="mx-1.5" style={{color:'var(--border)'}}>|</span>}
            <button type="button" onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)} style={{color:'var(--accent)'}}>{term}</button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
