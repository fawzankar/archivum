'use client';

import React, { useMemo, useState } from 'react';
import { Resource } from '@/lib/resources';
import ResourceCard from '@/components/ResourceCard';
import PdfViewerModal from '@/components/PdfViewerModal';
import { BookOpen, FolderOpen } from 'lucide-react';
import { resourceSubjectMatches, subjectsForClass } from '@/lib/subjects';

interface NotesClientProps { allNotes: Resource[]; initialClass: number; initialSubject: string; }

export default function NotesClient({ allNotes, initialClass, initialSubject }: NotesClientProps) {
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || '');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [activePdf, setActivePdf] = useState<Resource | null>(null);

  const classNotes = useMemo(() => allNotes.filter(n => n.class_level === selectedClass), [allNotes, selectedClass]);
  const subjects = subjectsForClass(selectedClass);
  const activeSubject = selectedSubject && subjects.includes(selectedSubject) ? selectedSubject : '';
  const subjectNotes = useMemo(() => activeSubject ? classNotes.filter(n => resourceSubjectMatches(n.subject, activeSubject)) : classNotes, [classNotes, activeSubject]);
  const chapters = useMemo(() => Array.from(new Set(subjectNotes.map(n => n.chapter).filter(Boolean) as string[])).sort(), [subjectNotes]);
  const filtered = useMemo(() => selectedChapter ? subjectNotes.filter(n => n.chapter?.toLowerCase() === selectedChapter.toLowerCase()) : subjectNotes, [subjectNotes, selectedChapter]);

  return (
    <div className="space-y-9 py-8">
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b" style={{borderColor:'var(--border)'}}>
          <div>
            <h2 className="text-2xl font-semibold">Class {selectedClass} notes</h2>
            <p className="text-sm mt-2" style={{color:'var(--ink-muted)'}}>Filter by subject or chapter, then open any resource to read it.</p>
          </div>
          <span className="text-sm" style={{color:'var(--ink-faint)'}}>{classNotes.length} resources</span>
        </div>

        <div className="py-5 border-b" style={{borderColor:'var(--border-light)'}}>
          <div className="text-xs font-medium mb-3" style={{color:'var(--ink-muted)'}}>Subject</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button className="btn shrink-0" onClick={() => {setSelectedSubject('');setSelectedChapter('')}} style={{background:!activeSubject?'var(--accent)':'var(--surface)',color:!activeSubject?'var(--accent-contrast)':'var(--ink)',borderColor:!activeSubject?'var(--accent)':'var(--border)'}}>All subjects</button>
            {subjects.map(subject => (
              <button key={subject} className="btn shrink-0" onClick={() => {setSelectedSubject(subject);setSelectedChapter('')}} style={{background:activeSubject===subject?'var(--accent-light)':'var(--surface)',color:activeSubject===subject?'var(--accent)':'var(--ink)',borderColor:activeSubject===subject?'var(--accent)':'var(--border)'}}>
                {subject}
              </button>
            ))}
          </div>
        </div>

        {chapters.length > 0 && (
          <div className="py-4 flex flex-wrap items-center gap-2 border-b" style={{borderColor:'var(--border-light)'}}>
            <span className="inline-flex items-center gap-2 text-xs font-medium mr-1" style={{color:'var(--ink-muted)'}}><FolderOpen className="w-4 h-4" style={{color:'var(--accent)'}} /> Chapter</span>
            <button className="btn" onClick={() => setSelectedChapter('')} style={{background:!selectedChapter?'var(--accent-light)':'var(--surface)',color:!selectedChapter?'var(--accent)':'var(--ink-muted)'}}>All</button>
            {chapters.map(chapter => (
              <button key={chapter} className="btn" onClick={() => setSelectedChapter(chapter)} style={{background:selectedChapter===chapter?'var(--accent-light)':'var(--surface)',color:selectedChapter===chapter?'var(--accent)':'var(--ink-muted)'}}>{chapter}</button>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div><span className="eyebrow">Results</span><h3 className="text-xl font-semibold">{activeSubject || 'All subjects'} <span className="text-sm font-normal" style={{color:'var(--ink-faint)'}}>({filtered.length})</span></h3></div>
        </div>
        {filtered.length ? (
          <div className="resource-grid">{filtered.map(resource => <ResourceCard key={resource.id} resource={resource} onView={setActivePdf} />)}</div>
        ) : (
          <div className="archive-surface p-10 text-center">
            <BookOpen className="w-8 h-8 mx-auto" style={{color:'var(--ink-faint)'}} />
            <h3 className="mt-3 text-lg font-semibold">No notes match this selection.</h3>
            <p className="mt-2 text-sm max-w-md mx-auto" style={{color:'var(--ink-muted)'}}>You can upload the first useful resource for Class {selectedClass}{activeSubject ? ` ${activeSubject}` : ''}.</p>
            <a className="btn btn-primary mt-5" href={`/upload?class=${selectedClass}${activeSubject ? `&subject=${encodeURIComponent(activeSubject)}` : ''}`}>Upload a resource</a>
          </div>
        )}
      </section>
      <PdfViewerModal resource={activePdf} onClose={() => setActivePdf(null)} />
    </div>
  );
}
