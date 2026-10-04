'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Resource } from '@/lib/resources';
import ResourceCard from '@/components/ResourceCard';
import PdfViewerModal from '@/components/PdfViewerModal';
import { SlidersHorizontal, ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react';
import { ASearch as Search } from '@/components/AnimatedIcons';

interface SearchClientProps {
  initialQuery: string;
  initialClass?: number;
  initialSubject?: string;
  initialType?: string;
  initialPaperType?: string;
  initialYear?: number;
  initialSchool?: string;
  initialSort: string;
  initialData: {
    items: Resource[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}

export default function SearchClient({
  initialQuery,
  initialClass,
  initialSubject,
  initialType,
  initialPaperType,
  initialYear,
  initialSchool,
  initialSort,
  initialData,
}: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  // The query that actually drives fetching/URL. `query` is just what's typed in the box.
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const lastUrlQuery = useRef(initialQuery);
  const [selectedClass, setSelectedClass] = useState<number | undefined>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || '');
  const [selectedType, setSelectedType] = useState<string>(initialType || '');
  const [selectedPaperType, setSelectedPaperType] = useState<string>(initialPaperType || '');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);
  const [selectedSchool, setSelectedSchool] = useState<string>(initialSchool || '');
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [page, setPage] = useState<number>(initialData.currentPage);

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [activePdf, setActivePdf] = useState<Resource | null>(null);
  const firstFetch = useRef(true);
  const requestRef = useRef<AbortController | null>(null);

  // Only follow the URL when it changed from somewhere else (e.g. the navbar search),
  // never because of our own typing/clearing - that was snapping the box back.
  const urlQuery = searchParams.get('q') || '';
  useEffect(() => {
    if (urlQuery === lastUrlQuery.current) return;
    lastUrlQuery.current = urlQuery;
    setQuery(urlQuery);
    setActiveQuery(urlQuery);
    setPage(1);
  }, [urlQuery]);

  const syncUrl = useCallback((value: string) => {
    const trimmed = value.trim();
    lastUrlQuery.current = trimmed;
    const params = new URLSearchParams(window.location.search);
    if (trimmed) params.set('q', trimmed); else params.delete('q');
    params.delete('page');
    const qs = params.toString();
    router.replace(`/search${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router]);

  // Live search: wait for a short pause in typing (including deleting) before fetching.
  useEffect(() => {
    if (query.trim() === activeQuery.trim()) return;
    const timer = window.setTimeout(() => {
      setActiveQuery(query);
      setPage(1);
      syncUrl(query);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query, activeQuery, syncUrl]);

  const fetchResults = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeQuery.trim()) params.set('q', activeQuery.trim());
      if (selectedClass) params.set('class', selectedClass.toString());
      if (selectedSubject) params.set('subject', selectedSubject);
      if (selectedType) params.set('type', selectedType);
      if (selectedPaperType) params.set('paperType', selectedPaperType);
      if (selectedYear) params.set('year', selectedYear.toString());
      if (selectedSchool) params.set('school', selectedSchool);
      if (sortBy) params.set('sort', sortBy);
      if (page > 1) params.set('page', page.toString());

      const res = await fetch(`/api/resources?${params.toString()}`, { signal: controller.signal });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    } finally {
      setLoading(false);
    }
  }, [activeQuery, selectedClass, selectedSubject, selectedType, selectedPaperType, selectedYear, selectedSchool, sortBy, page]);

  useEffect(() => {
    if (firstFetch.current) { firstFetch.current = false; return; }
    fetchResults();
    return () => requestRef.current?.abort();
  }, [fetchResults]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(query);
    setPage(1);
    syncUrl(query);
  };

  const clearSearch = () => {
    setQuery('');
    setActiveQuery('');
    setPage(1);
    syncUrl('');
  };

  const resetAll = () => {
    setQuery('');
    setActiveQuery('');
    syncUrl('');
    setSelectedClass(undefined);
    setSelectedSubject('');
    setSelectedType('');
    setSelectedPaperType('');
    setSelectedYear(undefined);
    setSelectedSchool('');
    setSortBy('relevance');
    setPage(1);
  };

  const hasFilters = Boolean(
    query || selectedClass || selectedSubject || selectedType || selectedPaperType || selectedYear || selectedSchool
  );

  return (
    <div className="library-finder search-library-finder space-y-6">
      
      <form onSubmit={handleSearchSubmit} className="search-library-bar relative w-full">
        <div
          className="relative flex items-center w-full rounded-2xl border transition-all duration-200 focus-within:shadow-lg"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <Search className="w-5 h-5 ml-4 shrink-0" style={{ color: 'var(--ink-muted)' }} />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search resources"
            placeholder=""
            className="w-full py-4 px-3.5 text-sm bg-transparent outline-none font-normal"
            style={{ color: 'var(--ink)' }}
          />

          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clearSearch}
              className="mr-3 p-1 rounded-full text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="mr-2 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: 'var(--sage)' }}
          >
            Search
          </button>
        </div>
      </form>

      <div
        className="p-3 sm:p-4 rounded-2xl border space-y-4"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-semibold text-zinc-400 mr-1 uppercase tracking-wider">Class:</span>
            {[
              { val: undefined, label: 'All' },
              { val: 9, label: 'Class 9' },
              { val: 10, label: 'Class 10' },
              { val: 11, label: 'Class 11' },
              { val: 12, label: 'Class 12' },
            ].map((c) => {
              const active = selectedClass === c.val;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => { setSelectedClass(c.val); setPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--ink)' : 'transparent',
                    color: active ? 'var(--surface)' : 'var(--ink-muted)',
                    border: active ? '1px solid var(--ink)' : '1px solid var(--border)',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] font-medium text-zinc-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="text-xs py-1 px-2.5 rounded-lg border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest First</option>
              <option value="downloads">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
              className="w-full text-xs py-1.5 px-2.5 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="">All Resource Types</option>
              <option value="Notes">Notes Only</option>
              <option value="Previous Year Paper">Previous Papers Only</option>
              <option value="Study Material">Study Material</option>
              <option value="Syllabus">Syllabus</option>
            </select>
          </div>

          <div>
            <select
              value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setPage(1); }}
              className="w-full text-xs py-1.5 px-2.5 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Social Science">Social Science</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPaperType}
              onChange={(e) => { setSelectedPaperType(e.target.value); setPage(1); }}
              className="w-full text-xs py-1.5 px-2.5 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="">All Paper Types</option>
              <option value="Board">Board Paper</option>
              <option value="Pre board">Pre board</option>
              <option value="Unit Test">Unit Test</option>
              <option value="Annual/Final">Annual / Final</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            {hasFilters && (
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--ink-muted)' }}>
        <span>
          Found <strong className="font-semibold" style={{ color: 'var(--ink)' }}>{data.totalCount}</strong> resources
        </span>
        {loading && <span className="text-zinc-400">Updating...</span>}
      </div>

      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((r) => (
            <ResourceCard key={r.id} resource={r} onView={(res) => setActivePdf(res)} />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-16 rounded-2xl border space-y-3"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <Search className="w-10 h-10 mx-auto" style={{ color: 'var(--ink-faint)' }} />
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--ink)' }}>
            No resources match your search
          </h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--ink-muted)' }}>
            Try searching for a general term like "Science", "Math", "Class 10", or "Pre board".
          </p>
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2 rounded-xl border text-xs font-semibold disabled:opacity-30 cursor-pointer"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs px-3 font-medium" style={{ color: 'var(--ink-muted)' }}>
            Page {data.currentPage} of {data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            className="p-2 rounded-xl border text-xs font-semibold disabled:opacity-30 cursor-pointer"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <PdfViewerModal resource={activePdf} onClose={() => setActivePdf(null)} />
    </div>
  );
}
