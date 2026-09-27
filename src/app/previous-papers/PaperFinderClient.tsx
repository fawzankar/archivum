'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Resource } from '@/lib/resources';
import ResourceCard from '@/components/ResourceCard';
import PdfViewerModal from '@/components/PdfViewerModal';
import { FileText, RotateCcw } from 'lucide-react';
import { subjectsForClass, resourceSubjectMatches } from '@/lib/subjects';

interface PaperFinderProps {
  allPapers: Resource[];
  initialClass?: number;
  initialSubject?: string;
  initialPaperType?: string;
  initialYear?: number;
  initialSchool?: string;
}

const PAPER_TYPES = ['Board','Pre-board','Unit Test','Half-Yearly','Annual/Final','School Exam','Sample','Other'];

export default function PaperFinderClient({ allPapers, initialClass, initialSubject, initialPaperType, initialYear, initialSchool }: PaperFinderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedClass, setSelectedClass] = useState<number | undefined>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || '');
  const [selectedPaperType, setSelectedPaperType] = useState(initialPaperType || '');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);
  const [selectedSchool, setSelectedSchool] = useState(initialSchool || '');
  const [activePdf, setActivePdf] = useState<Resource | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedClass) params.set('class', `${selectedClass}`);
    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedPaperType) params.set('paperType', selectedPaperType);
    if (selectedYear) params.set('year', `${selectedYear}`);
    if (selectedSchool) params.set('school', selectedSchool);
    const next = params.toString();
    if (next !== searchParams.toString()) router.replace(`/previous-papers${next ? `?${next}` : ''}`, {scroll:false});
  }, [selectedClass, selectedSubject, selectedPaperType, selectedYear, selectedSchool, router, searchParams]);

  const availableSubjects = selectedClass ? subjectsForClass(selectedClass) : Array.from(new Set(allPapers.map(p => p.subject).filter(Boolean))).sort();
  const availableYears = useMemo(() => Array.from(new Set(allPapers.map(p => p.year).filter(Boolean) as number[])).sort((a,b)=>b-a), [allPapers]);
  const availableSchools = useMemo(() => Array.from(new Set(allPapers.map(p => p.school_name).filter(Boolean) as string[])).sort(), [allPapers]);

  const filteredPapers = useMemo(() => allPapers.filter(p => {
    if (selectedClass && p.class_level !== selectedClass) return false;
    if (selectedSubject && !resourceSubjectMatches(p.subject, selectedSubject)) return false;
    if (selectedPaperType && p.paper_type?.toLowerCase() !== selectedPaperType.toLowerCase()) return false;
    if (selectedYear && p.year !== selectedYear) return false;
    if (selectedSchool && p.school_name?.toLowerCase() !== selectedSchool.toLowerCase()) return false;
    return true;
  }), [allPapers, selectedClass, selectedSubject, selectedPaperType, selectedYear, selectedSchool]);

  const reset = () => {setSelectedClass(undefined);setSelectedSubject('');setSelectedPaperType('');setSelectedYear(undefined);setSelectedSchool('')};
  const hasFilters = Boolean(selectedClass || selectedSubject || selectedPaperType || selectedYear || selectedSchool);

  return (
    <div className="space-y-8 py-8">
      <section>
        <div className="flex items-end justify-between gap-4 pb-5 border-b" style={{borderColor:'var(--border)'}}>
          <div><h2 className="text-2xl font-semibold">Filter the papers</h2><p className="text-sm mt-2" style={{color:'var(--ink-muted)'}}>Narrow the archive by class, subject, exam type, year or school.</p></div>
          {hasFilters && <button className="btn btn-quiet" onClick={reset}><RotateCcw className="w-4 h-4" /> Reset filters</button>}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 py-5 border-b" style={{borderColor:'var(--border-light)'}}>
          <select className="form-control" value={selectedClass || ''} onChange={e=>{setSelectedClass(e.target.value?Number(e.target.value):undefined);setSelectedSubject('')}}>
            <option value="">All classes</option>{[9,10,11,12].map(n=><option key={n} value={n}>Class {n}</option>)}
          </select>
          <select className="form-control" value={selectedSubject} onChange={e=>setSelectedSubject(e.target.value)}>
            <option value="">All subjects</option>{availableSubjects.map(s=><option key={s}>{s}</option>)}
          </select>
          <select className="form-control" value={selectedPaperType} onChange={e=>setSelectedPaperType(e.target.value)}>
            <option value="">All paper types</option>{PAPER_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
          <select className="form-control" value={selectedYear || ''} onChange={e=>setSelectedYear(e.target.value?Number(e.target.value):undefined)}>
            <option value="">All years</option>{availableYears.map(y=><option key={y}>{y}</option>)}
          </select>
          <select className="form-control" value={selectedSchool} onChange={e=>setSelectedSchool(e.target.value)}>
            <option value="">All institutions</option>{availableSchools.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div><span className="eyebrow">Results</span><h3 className="text-xl font-semibold">{filteredPapers.length} papers</h3></div>
        </div>
        {filteredPapers.length ? (
          <div className="resource-grid">{filteredPapers.map(p => <ResourceCard key={p.id} resource={p} onView={setActivePdf} />)}</div>
        ) : (
          <div className="archive-surface p-10 text-center">
            <FileText className="w-8 h-8 mx-auto" style={{color:'var(--ink-faint)'}} />
            <h3 className="mt-3 text-lg font-semibold">No papers match these filters.</h3>
            <p className="mt-2 text-sm" style={{color:'var(--ink-muted)'}}>Try a broader selection or upload the paper if you have a copy.</p>
          </div>
        )}
      </section>
      <PdfViewerModal resource={activePdf} onClose={() => setActivePdf(null)} />
    </div>
  );
}
