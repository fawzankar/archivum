'use client';

import React, { useMemo, useState } from 'react';
import { Resource } from '@/lib/resources';
import ResourceCard from '@/components/ResourceCard';
import { BookOpen, FolderOpen, ArrowRight, Layers3 } from 'lucide-react';
import { CLASS_SUBJECTS, resourceSubjectMatches, subjectsForClass } from '@/lib/subjects';

interface NotesClientProps {
  allNotes: Resource[];
  initialClass: number;
  initialSubject: string;
}

const CLASS_CONFIG = [9, 10, 11, 12] as const;

export default function NotesClient({ allNotes, initialClass, initialSubject }: NotesClientProps) {
  const [selectedClass, setSelectedClass] = useState<number>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || '');
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  const classNotes = useMemo(() => allNotes.filter((n) => n.class_level === selectedClass), [allNotes, selectedClass]);
  const availableSubjects = subjectsForClass(selectedClass);
  const activeSubject = selectedSubject && availableSubjects.includes(selectedSubject) ? selectedSubject : '';

  const subjectNotes = useMemo(() => {
    if (!activeSubject) return classNotes;
    return classNotes.filter((n) => resourceSubjectMatches(n.subject, activeSubject));
  }, [classNotes, activeSubject]);

  const availableChapters = useMemo(() => {
    const set = new Set<string>();
    subjectNotes.forEach((n) => { if (n.chapter) set.add(n.chapter); });
    return Array.from(set);
  }, [subjectNotes]);

  const filteredNotes = useMemo(() => {
    if (!selectedChapter) return subjectNotes;
    return subjectNotes.filter((n) => n.chapter?.toLowerCase() === selectedChapter.toLowerCase());
  }, [subjectNotes, selectedChapter]);

  return (
    <div className="space-y-7 sm:space-y-9">
      <section className="rounded-[2rem] border overflow-hidden premium-shadow" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="p-5 sm:p-7" style={{ background: 'linear-gradient(135deg, var(--accent-light), var(--surface))' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[.22em]" style={{ color: 'var(--accent)' }}>CLASS {selectedClass} · NOTES LIBRARY</span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl mt-2">Choose a subject</h2>
              <p className="text-xs sm:text-sm mt-1.5" style={{ color: 'var(--ink-muted)' }}>Your class profile controls the subject list, so you only see what applies to you.</p>
            </div>
            <Layers3 className="w-6 h-6 shrink-0" style={{ color: 'var(--accent)' }} />
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <button onClick={() => { setSelectedSubject(''); setSelectedChapter(''); }} className="rounded-2xl border p-3.5 text-left transition-all duration-300 hover:-translate-y-0.5" style={{ borderColor: !activeSubject ? 'var(--accent)' : 'var(--border)', background: !activeSubject ? 'var(--accent-light)' : 'var(--surface-raised)', color: !activeSubject ? 'var(--accent)' : 'var(--ink)' }}>
              <span className="block text-lg font-display font-bold">All</span>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--ink-muted)' }}>{classNotes.length} resources</span>
            </button>
            {availableSubjects.map((subject) => {
              const active = activeSubject === subject;
              const count = classNotes.filter(n => resourceSubjectMatches(n.subject, subject)).length;
              return (
                <button key={subject} onClick={() => { setSelectedSubject(subject); setSelectedChapter(''); }} className="rounded-2xl border p-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 active:scale-[.98]" style={{ borderColor: active ? 'var(--accent)' : 'var(--border)', background: active ? 'var(--accent)' : 'var(--surface-raised)', color: active ? 'var(--accent-contrast)' : 'var(--ink)' }}>
                  <span className="block text-base sm:text-lg font-display font-bold">{subject}</span>
                  <span className="text-[10px] font-semibold opacity-70">{count} {count === 1 ? 'resource' : 'resources'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {CLASS_CONFIG.map(level => (
              <button key={level} onClick={() => { setSelectedClass(level); setSelectedSubject(''); setSelectedChapter(''); }} className="shrink-0 px-4 py-2 rounded-full text-[11px] font-bold border transition-all" style={{ borderColor: selectedClass === level ? 'var(--accent)' : 'var(--border)', background: selectedClass === level ? 'var(--accent-light)' : 'var(--surface)', color: selectedClass === level ? 'var(--accent)' : 'var(--ink-muted)' }}>Class {level}</button>
            ))}
          </div>
        </div>
      </section>

      {availableChapters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl border animate-fade" style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
          <span className="text-xs font-semibold mr-1 flex items-center gap-1.5" style={{ color: 'var(--ink-muted)' }}><FolderOpen className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Chapter</span>
          <button onClick={() => setSelectedChapter('')} className="px-3 py-1.5 rounded-lg text-[11px] font-bold" style={{ background: !selectedChapter ? 'var(--accent)' : 'transparent', color: !selectedChapter ? 'var(--accent-contrast)' : 'var(--ink-muted)' }}>All</button>
          {availableChapters.map(ch => <button key={ch} onClick={() => setSelectedChapter(ch)} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold" style={{ background: selectedChapter === ch ? 'var(--accent-light)' : 'transparent', color: selectedChapter === ch ? 'var(--accent)' : 'var(--ink-muted)' }}>{ch}</button>)}
        </div>
      )}

      <div className="flex items-end justify-between gap-4">
        <div><p className="text-[10px] uppercase tracking-[.18em] font-bold" style={{ color: 'var(--accent)' }}>ARCHIVE RESULTS</p><h3 className="font-display font-bold text-xl mt-1">{activeSubject || 'All subjects'} <span className="text-sm font-medium" style={{ color: 'var(--ink-faint)' }}>· {filteredNotes.length}</span></h3></div>
        <span className="hidden sm:block text-[11px]" style={{ color: 'var(--ink-muted)' }}>Class {selectedClass}</span>
      </div>

      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredNotes.map((r, index) => <div key={r.id} className="animate-fade" style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}><ResourceCard resource={r} /></div>)}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <BookOpen className="w-10 h-10 mx-auto" style={{ color: 'var(--ink-faint)' }} />
          <h3 className="font-display font-bold text-lg">No notes yet for {activeSubject || 'this class'}</h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--ink-muted)' }}>The subject is available in ARCHIVUM. Check back when new material is added to the archive.</p>
          <a href={`/about`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}>About ARCHIVUM <ArrowRight className="w-3.5 h-3.5" /></a>
        </div>
      )}
    </div>
  );
}
