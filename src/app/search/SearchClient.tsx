'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Resource } from '@/lib/resources';
import ResourceCard from '@/components/ResourceCard';
import PdfViewerModal from '@/components/PdfViewerModal';
import { Search, RotateCcw, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SearchClientProps {
  initialQuery: string;
  initialClass?: number;
  initialSubject?: string;
  initialType?: string;
  initialPaperType?: string;
  initialYear?: number;
  initialSchool?: string;
  initialSort: string;
  initialData: { items: Resource[]; totalCount: number; totalPages: number; currentPage: number; };
}

export default function SearchClient({ initialQuery, initialClass, initialSubject, initialType, initialPaperType, initialYear, initialSchool, initialSort, initialData }: SearchClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedClass, setSelectedClass] = useState<number | undefined>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || '');
  const [selectedType, setSelectedType] = useState(initialType || '');
  const [selectedPaperType, setSelectedPaperType] = useState(initialPaperType || '');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);
  const [selectedSchool, setSelectedSchool] = useState(initialSchool || '');
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(initialData.currentPage);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [activePdf, setActivePdf] = useState<Resource | null>(null);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (selectedClass) params.set('class', `${selectedClass}`);
      if (selectedSubject) params.set('subject', selectedSubject);
      if (selectedType) params.set('type', selectedType);
      if (selectedPaperType) params.set('paperType', selectedPaperType);
      if (selectedYear) params.set('year', `${selectedYear}`);
      if (selectedSchool) params.set('school', selectedSchool);
      if (sortBy) params.set('sort', sortBy);
      if (page > 1) params.set('page', `${page}`);
      const response = await fetch(`/api/resources?${params.toString()}`);
      if (response.ok) setData(await response.json());
    } finally {
      setLoading(false);
    }
  }, [query, selectedClass, selectedSubject, selectedType, selectedPaperType, selectedYear, selectedSchool, sortBy, page]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const reset = () => {
    setQuery(''); setSelectedClass(undefined); setSelectedSubject(''); setSelectedType('');
    setSelectedPaperType(''); setSelectedYear(undefined); setSelectedSchool('');
    setSortBy('relevance'); setPage(1);
  };

  const hasFilters = Boolean(query || selectedClass || selectedSubject || selectedType || selectedPaperType || selectedYear || selectedSchool);

  return (
    <div className="space-y-8">
      <form onSubmit={e => {e.preventDefault();setPage(1);fetchResults()}} className="home-search__box">
        <Search className="w-5 h-5 ml-4 shrink-0" style={{color:'var(--ink-muted)'}} />
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search notes, papers, chapters or topics" aria-label="Search archive" />
        {query && <button type="button" className="btn-quiet" onClick={()=>{setQuery('');setPage(1)}} aria-label="Clear search"><X className="w-4 h-4" /></button>}
        <button className="btn btn-primary mr-1.5" type="submit">Search</button>
      </form>

      <section className="archive-surface p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b" style={{borderColor:'var(--border)'}}>
          <div><h2 className="text-base font-semibold">Narrow the results</h2><p className="text-xs mt-1" style={{color:'var(--ink-muted)'}}>Filters work together, so you can search within a class or subject.</p></div>
          {hasFilters && <button className="btn btn-quiet" onClick={reset}><RotateCcw className="w-4 h-4" /> Reset</button>}
        </div>

        <div className="flex flex-wrap gap-2 py-4 border-b" style={{borderColor:'var(--border-light)'}}>
          {[undefined,9,10,11,12].map(level => (
            <button key={level ?? 'all'} className="btn" onClick={()=>{setSelectedClass(level);setPage(1)}} style={{background:selectedClass===level?'var(--accent-light)':'var(--surface)',color:selectedClass===level?'var(--accent)':'var(--ink-muted)',borderColor:selectedClass===level?'var(--accent)':'var(--border)'}}>
              {level ? `Class ${level}` : 'All classes'}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          <select className="form-control" value={selectedType} onChange={e=>{setSelectedType(e.target.value);setPage(1)}}>
            <option value="">All resource types</option><option value="Notes">Notes</option><option value="Previous Year Paper">Previous papers</option><option value="Study Material">Study material</option><option value="Syllabus">Syllabus</option>
          </select>
          <select className="form-control" value={selectedSubject} onChange={e=>{setSelectedSubject(e.target.value);setPage(1)}}>
            <option value="">All subjects</option>
            {['Mathematics','Science','Social Science','English','Hindi','Urdu','Physics','Chemistry','Biology'].map(s=><option key={s}>{s}</option>)}
          </select>
          <select className="form-control" value={selectedPaperType} onChange={e=>{setSelectedPaperType(e.target.value);setPage(1)}}>
            <option value="">All paper types</option><option value="Board">Board</option><option value="Pre-board">Pre-board</option><option value="Unit Test">Unit Test</option><option value="Annual/Final">Annual / Final</option>
          </select>
          <select className="form-control" value={sortBy} onChange={e=>{setSortBy(e.target.value);setPage(1)}}>
            <option value="relevance">Relevance</option><option value="newest">Newest first</option><option value="downloads">Most downloaded</option><option value="rating">Highest rated</option>
          </select>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div><span className="eyebrow">Search results</span><h2 className="text-xl font-semibold">{data.totalCount} resources</h2></div>
          {loading && <span className="text-xs" style={{color:'var(--ink-faint)'}}>Updating…</span>}
        </div>

        {data.items.length ? (
          <div className="resource-grid">{data.items.map(resource=><ResourceCard key={resource.id} resource={resource} onView={setActivePdf} />)}</div>
        ) : (
          <div className="archive-surface p-10 text-center">
            <Search className="w-8 h-8 mx-auto" style={{color:'var(--ink-faint)'}} />
            <h3 className="mt-3 text-lg font-semibold">Nothing matched that search.</h3>
            <p className="mt-2 text-sm max-w-md mx-auto" style={{color:'var(--ink-muted)'}}>Try a broader phrase, another class or a different resource type.</p>
            <button className="btn btn-secondary mt-5" onClick={reset}>Clear search</button>
          </div>
        )}
      </section>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-3">
          <button className="btn btn-secondary" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}><ChevronLeft className="w-4 h-4" /> Previous</button>
          <span className="text-sm" style={{color:'var(--ink-muted)'}}>Page {data.currentPage} of {data.totalPages}</span>
          <button className="btn btn-secondary" disabled={page>=data.totalPages} onClick={()=>setPage(p=>Math.min(data.totalPages,p+1))}>Next <ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      <PdfViewerModal resource={activePdf} onClose={()=>setActivePdf(null)} />
    </div>
  );
}
