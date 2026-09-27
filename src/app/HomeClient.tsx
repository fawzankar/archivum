'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HomeClient({ initialSearch = '' }: { initialSearch?: string }) {
  const [query, setQuery] = useState(initialSearch);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSearch} className="relative w-full">
        <div className="premium-search relative flex items-center w-full min-h-[56px]">
          <Search className="w-5 h-5 ml-4 shrink-0" style={{ color: 'var(--accent)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a subject, chapter, paper or topic"
            className="w-full min-w-0 py-4 px-3 text-sm bg-transparent outline-none"
            style={{ color: 'var(--ink)' }}
            aria-label="Search the ARCHIVUM archive"
          />
          <button type="submit" className="mr-2 premium-button premium-button-primary text-xs shrink-0">Search</button>
        </div>
      </form>
      <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--ink-muted)' }}>
        <span>Try</span>
        <button type="button" onClick={() => handleQuickSearch('class 10 science')} className="font-medium hover:text-[var(--accent)]">Class 10 Science</button>
        <span aria-hidden="true" style={{ color: 'var(--border)' }}>•</span>
        <button type="button" onClick={() => handleQuickSearch('chemical reactions')} className="font-medium hover:text-[var(--accent)]">Chemical Reactions</button>
        <span aria-hidden="true" style={{ color: 'var(--border)' }}>•</span>
        <button type="button" onClick={() => handleQuickSearch('previous papers')} className="font-medium hover:text-[var(--accent)]">Previous Papers</button>
        
      </div>
    </div>
  );
}
