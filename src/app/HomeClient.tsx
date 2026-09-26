'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HomeClient({ initialSearch = '' }: { initialSearch?: string }) {
  const [query, setQuery] = useState(initialSearch);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Input Bar (Matching reference mockup exactly) */}
      <form onSubmit={handleSearch} className="relative w-full">
        <div
          className="relative flex items-center w-full rounded-2xl border transition-all duration-200 shadow-sm focus-within:shadow-md focus-within:border-zinc-400"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <Search
            className="w-4 h-4 ml-4 shrink-0"
            style={{ color: 'var(--ink-muted)' }}
          />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, papers, subjects..."
            className="w-full py-3.5 px-3.5 text-xs sm:text-sm bg-transparent outline-none font-sans font-normal"
            style={{ color: 'var(--ink)' }}
          />

          {/* ⌘ K keyboard shortcut hint */}
          <div className="mr-3 shrink-0 flex items-center">
            <span
              className="hidden sm:inline-flex items-center text-[10px] font-mono px-2 py-1 rounded-md border font-medium"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface-raised)',
                color: 'var(--ink-faint)',
              }}
            >
              ⌘ K
            </span>
          </div>
        </div>
      </form>

      {/* "Try searching: class 10 science · chemical reactions · previous papers" */}
      <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--ink-muted)' }}>
        <span className="text-zinc-400">Try searching:</span>
        <button
          type="button"
          onClick={() => handleQuickSearch('class 10 science')}
          className="hover:underline transition-colors cursor-pointer"
          style={{ color: 'var(--ink-muted)' }}
        >
          class 10 science
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">·</span>
        <button
          type="button"
          onClick={() => handleQuickSearch('chemical reactions')}
          className="hover:underline transition-colors cursor-pointer"
          style={{ color: 'var(--ink-muted)' }}
        >
          chemical reactions
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">·</span>
        <button
          type="button"
          onClick={() => handleQuickSearch('previous papers')}
          className="hover:underline transition-colors cursor-pointer"
          style={{ color: 'var(--ink-muted)' }}
        >
          previous papers
        </button>
      </div>
    </div>
  );
}
