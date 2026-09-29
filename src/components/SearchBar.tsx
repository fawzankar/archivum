'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';

export default function SearchBar({ className = '', initialValue = '', onSearch }: { className?: string; initialValue?: string; onSearch?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    onSearch?.();
  };

  return <form className={`clean-search ${className}`.trim()} onSubmit={submit} role="search">
    <Search aria-hidden="true" />
    <input value={query} onChange={event => setQuery(event.target.value)} aria-label="Search the archive" autoComplete="off" />
    <button type="submit" aria-label="Search"><ArrowRight /></button>
  </form>;
}
