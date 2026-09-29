'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Resource } from '@/lib/resources';
import ResourceCard from '@/components/ResourceCard';
import { ArrowRight, BookOpen } from 'lucide-react';
import { resourceSubjectMatches, subjectsForClass } from '@/lib/subjects';

interface NotesClientProps {
  allNotes: Resource[];
  initialClass: number;
  initialSubject: string;
}

const CLASS_CONFIG = [9, 10, 11, 12] as const;
const notesCache = new Map<number, Resource[]>();

function mergeUnique(current: Resource[], incoming: Resource[]) {
  const map = new Map<number, Resource>();
  for (const item of [...current, ...incoming]) map.set(item.id, item);
  return [...map.values()];
}

export default function NotesClient({ allNotes, initialClass, initialSubject }: NotesClientProps) {
  const [selectedClass, setSelectedClass] = useState<number>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || '');
  const [notes, setNotes] = useState<Resource[]>(allNotes);
  const [loading, setLoading] = useState(false);
  const loadedClasses = useRef(new Set<number>());

  useEffect(() => {
    if (loadedClasses.current.has(selectedClass)) return;
    loadedClasses.current.add(selectedClass);

    const cached = notesCache.get(selectedClass);
    if (cached) {
      setNotes(current => mergeUnique(current, cached));
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/resources?class=${selectedClass}&type=Notes&limit=50`, { cache: 'force-cache', signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Could not load notes')))
      .then((json) => {
        const incoming = Array.isArray(json.items) ? json.items as Resource[] : [];
        notesCache.set(selectedClass, incoming);
        setNotes(current => mergeUnique(current, incoming));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [selectedClass]);

  const classNotes = useMemo(() => {
    const seen = new Set<string>();
    return notes.filter(n => n.class_level === selectedClass).filter(n => {
      const key = `${n.class_level}|${n.subject}|${n.title.trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [notes, selectedClass]);

  const availableSubjects = subjectsForClass(selectedClass);
  const activeSubject = selectedSubject && availableSubjects.includes(selectedSubject) ? selectedSubject : '';
  const subjectCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const subject of availableSubjects) counts.set(subject, classNotes.filter(n => resourceSubjectMatches(n.subject, subject)).length);
    return counts;
  }, [availableSubjects, classNotes]);
  const filteredNotes = useMemo(
    () => activeSubject ? classNotes.filter(n => resourceSubjectMatches(n.subject, activeSubject)) : classNotes,
    [classNotes, activeSubject],
  );

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="notes-library-panel">
        <div className="notes-library-toolbar">
          <div className="notes-library-label">Class {selectedClass} · Notes</div>
          <h2 className="notes-library-heading">Browse your notes</h2>
          <div className="notes-class-row" aria-label="Choose class">
            {CLASS_CONFIG.map(level => (
              <button
                key={level}
                type="button"
                onClick={() => { setSelectedClass(level); setSelectedSubject(''); }}
                className={`notes-filter-button ${selectedClass === level ? 'active' : ''}`}
              >Class {level}</button>
            ))}
          </div>
        </div>
        <div className="notes-subject-row" aria-label="Choose subject">
          <button type="button" onClick={() => setSelectedSubject('')} className={`notes-subject-button ${!activeSubject ? 'active' : ''}`}>
            All <span>({classNotes.length})</span>
          </button>
          {availableSubjects.map(subject => (
            <button key={subject} type="button" onClick={() => setSelectedSubject(subject)} className={`notes-subject-button ${activeSubject === subject ? 'active' : ''}`}>
              {subject} <span>({subjectCounts.get(subject) || 0})</span>
            </button>
          ))}
        </div>
      </section>

      <div className="notes-result-head">
        <div>
          <p>Archive results</p>
          <h3>{activeSubject || 'All subjects'}</h3>
        </div>
        <span className="notes-count">{filteredNotes.length} {filteredNotes.length === 1 ? 'resource' : 'resources'}</span>
      </div>

      {loading && filteredNotes.length === 0 ? (
        <div className="notes-centered-loading" role="status"><span className="notes-loading-dot" /><strong>Opening notes</strong><small>Preparing your class library</small></div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredNotes.map(resource => <ResourceCard key={resource.id} resource={resource} />)}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <BookOpen className="w-10 h-10 mx-auto" style={{ color: 'var(--ink-faint)' }} />
          <h3 className="font-display font-bold text-lg">No notes yet for {activeSubject || `Class ${selectedClass}`}</h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--ink-muted)' }}>New material appears here as soon as it is approved.</p>
          <a href="/about" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}>About ARCHIVUM <ArrowRight className="w-3.5 h-3.5" /></a>
        </div>
      )}
    </div>
  );
}
