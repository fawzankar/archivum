'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import type { LibraryBundle, Resource } from '@/lib/resources';
import ResourceCard from '@/components/ResourceCard';
import { Filter, RotateCcw, Layers3 } from 'lucide-react';
import { AFile as FileText } from '@/components/AnimatedIcons';
import { subjectsForClass, resourceSubjectMatches } from '@/lib/subjects';
import { allPapersSorted, useLibraryBundle } from '@/lib/libraryCache';

// Heavy PDF viewer is only needed once someone opens a paper.
const PdfViewerModal = dynamic(() => import('@/components/PdfViewerModal'), { ssr: false });

const PAPER_TYPES = [
  'Board',
  'Pre-board',
  'Unit Test',
  'Half-Yearly',
  'Annual/Final',
  'School Exam',
  'Sample',
  'Other',
];

interface PaperInitial {
  initialClass?: number;
  initialSubject?: string;
  initialPaperType?: string;
  initialYear?: number;
  initialSchool?: string;
}

function validClass(value: unknown): number | undefined {
  const n = Number(value);
  return [9, 10, 11, 12].includes(n) ? n : undefined;
}

/** Client wrapper: reads the URL filters + saved class, then renders the (static) paper library. */
export default function PaperFinderClient({ bundle: serverBundle }: { bundle: LibraryBundle }) {
  const params = useSearchParams();
  const bundle = useLibraryBundle(serverBundle);
  const classFromUrl = validClass(params.get('class'));
  const [storedClass, setStoredClass] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (classFromUrl !== undefined || params.has('class')) return;
    try { setStoredClass(validClass(localStorage.getItem('archivum_student_class'))); } catch {}
  }, [classFromUrl, params]);
  const initialClass = classFromUrl ?? (params.has('class') ? undefined : storedClass ?? 10);
  const year = params.get('year');
  return (
    <PaperFinderView
      key={`${initialClass ?? ''}:${params.get('subject') || ''}:${params.get('paperType') || ''}:${params.get('year') || ''}:${params.get('school') || ''}`}
      bundle={bundle}
      initialClass={initialClass}
      initialSubject={params.get('subject') || undefined}
      initialPaperType={params.get('paperType') || undefined}
      initialYear={year ? parseInt(year, 10) : undefined}
      initialSchool={params.get('school') || undefined}
    />
  );
}

/** Pure view: every paper is already in `bundle`, so filtering is instant and works offline. */
export function PaperFinderView({
  bundle,
  initialClass,
  initialSubject,
  initialPaperType,
  initialYear,
  initialSchool,
}: PaperInitial & { bundle: LibraryBundle }) {
  const [selectedClass, setSelectedClass] = useState<number | undefined>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || '');
  const [selectedPaperType, setSelectedPaperType] = useState<string>(initialPaperType || '');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);
  const [selectedSchool, setSelectedSchool] = useState<string>(initialSchool || '');
  const [activePdf, setActivePdf] = useState<Resource | null>(null);

  const papers: Resource[] = useMemo(
    () => (selectedClass ? bundle.papers[selectedClass] || [] : allPapersSorted(bundle)),
    [bundle, selectedClass],
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedClass) params.set('class', selectedClass.toString());
    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedPaperType) params.set('paperType', selectedPaperType);
    if (selectedYear) params.set('year', selectedYear.toString());
    if (selectedSchool) params.set('school', selectedSchool);

    const newQuery = params.toString();
    const nextUrl = `/previous-papers${newQuery ? `?${newQuery}` : ''}`;
    if (window.location.pathname + window.location.search !== nextUrl) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [selectedClass, selectedSubject, selectedPaperType, selectedYear, selectedSchool]);

  const availableSubjects = useMemo(() => {
    return selectedClass ? subjectsForClass(selectedClass) : Array.from(new Set(papers.map(p => p.subject).filter(Boolean))).sort();
  }, [papers, selectedClass]);

  const availableSchools = useMemo(() => {
    const set = new Set<string>();
    papers.forEach((p) => {
      if (p.school_name) set.add(p.school_name);
    });
    return Array.from(set).sort();
  }, [papers]);

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    papers.forEach((p) => {
      if (p.year) set.add(p.year);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [papers]);

  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      if (selectedClass && p.class_level !== selectedClass) return false;
      if (selectedSubject && !resourceSubjectMatches(p.subject, selectedSubject)) return false;
      if (selectedPaperType && p.paper_type?.toLowerCase() !== selectedPaperType.toLowerCase()) return false;
      if (selectedYear && p.year !== selectedYear) return false;
      if (selectedSchool && p.school_name?.toLowerCase() !== selectedSchool.toLowerCase()) return false;
      return true;
    });
  }, [papers, selectedClass, selectedSubject, selectedPaperType, selectedYear, selectedSchool]);

  const resetFilters = () => {
    setSelectedClass(undefined);
    setSelectedSubject('');
    setSelectedPaperType('');
    setSelectedYear(undefined);
    setSelectedSchool('');
  };

  const hasActiveFilters = Boolean(
    selectedClass || selectedSubject || selectedPaperType || selectedYear || selectedSchool
  );

  return (
    <div className="library-finder pyq-finder space-y-8">
      
      <div
        className="rounded-2xl border p-5 sm:p-6 space-y-4 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--ink)' }}>
            <Filter className="w-3.5 h-3.5" style={{ color: 'var(--sage)' }} />
            <span>Refine Examinations</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {selectedClass && (
          <div className="rounded-2xl border p-3.5" style={{ borderColor: 'var(--border-light)', background: 'var(--surface-raised)' }}>
            <div className="flex items-center gap-2 mb-2"><Layers3 className="w-3.5 h-3.5" style={{color:'var(--accent)'}}/><span className="text-[10px] font-bold uppercase tracking-wider" style={{color:'var(--ink-muted)'}}>Subjects for Class {selectedClass}</span></div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button onClick={()=>setSelectedSubject('')} className="shrink-0 px-3 py-2 rounded-xl text-[10px] font-bold" style={{background:!selectedSubject?'var(--accent)':'var(--surface)',color:!selectedSubject?'var(--accent-contrast)':'var(--ink-muted)'}}>All</button>
              {subjectsForClass(selectedClass).map(sub=><button key={sub} onClick={()=>setSelectedSubject(sub)} className="shrink-0 px-3 py-2 rounded-xl text-[10px] font-bold border" style={{borderColor:selectedSubject===sub?'var(--accent)':'var(--border)',background:selectedSubject===sub?'var(--accent-light)':'var(--surface)',color:selectedSubject===sub?'var(--accent)':'var(--ink-muted)'}}>{sub}</button>)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>
              Class
            </label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full text-xs py-2 px-3 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="">All Classes</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>
              Paper Type
            </label>
            <select
              value={selectedPaperType}
              onChange={(e) => setSelectedPaperType(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="">All Types</option>
              {PAPER_TYPES.map((pt) => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>
              Year
            </label>
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full text-xs py-2 px-3 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>
              School / Board
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="">All Institutions</option>
              {availableSchools.map((sch) => (
                <option key={sch} value={sch}>{sch}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--ink-muted)' }}>
        <span>
          Showing <strong className="font-semibold" style={{ color: 'var(--ink)' }}>{filteredPapers.length}</strong> examination papers
        </span>
      </div>

      {filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <ResourceCard key={paper.id} resource={paper} onView={(res) => setActivePdf(res)} />
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
          <FileText className="w-10 h-10 mx-auto" style={{ color: 'var(--ink-faint)' }} />
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--ink)' }}>
            No examination papers match your filters
          </h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--ink-muted)' }}>
            Try resetting your filters or check back when new papers are added.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      <PdfViewerModal resource={activePdf} onClose={() => setActivePdf(null)} />
    </div>
  );
}
