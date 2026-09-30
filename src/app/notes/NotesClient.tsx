'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Resource } from '@/lib/resources';
import ResourceCard from '@/components/ResourceCard';
import { BookOpen, ArrowRight } from 'lucide-react';
import Art from '@/components/Art';
import { resourceSubjectMatches, subjectsForClass } from '@/lib/subjects';

interface NotesClientProps {
  allNotes: Resource[];
  initialClass: number;
  initialSubject: string;
}

const CLASS_CONFIG = [9, 10, 11, 12] as const;
const classCache = new Map<number, Resource[]>();

function mergeUnique(items: Resource[]) {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export default function NotesClient({ allNotes, initialClass, initialSubject }: NotesClientProps) {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<number>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || '');
  const [notes, setNotes] = useState<Resource[]>(() => {
    if (typeof window === 'undefined') return mergeUnique(allNotes);
    try {
      const cached = sessionStorage.getItem('archivum_notes_bundle_v23');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) return mergeUnique(parsed as Resource[]);
      }
    } catch {}
    return mergeUnique(allNotes);
  });

  React.useEffect(() => {
    try {
      sessionStorage.setItem('archivum_notes_bundle_v23', JSON.stringify(allNotes));
    } catch {}
  }, [allNotes]);

  const classNotes = useMemo(() => {
    const seen = new Set<string>();
    return notes
      .filter((n) => n.class_level === selectedClass)
      .filter((n) => {
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
    for (const subject of availableSubjects) counts.set(subject, 0);
    for (const resource of classNotes) {
      for (const subject of availableSubjects) {
        if (resourceSubjectMatches(resource.subject, subject)) {
          counts.set(subject, (counts.get(subject) || 0) + 1);
        }
      }
    }
    return counts;
  }, [availableSubjects, classNotes]);

  const filteredNotes = useMemo(
    () => activeSubject ? classNotes.filter((n) => resourceSubjectMatches(n.subject, activeSubject)) : classNotes,
    [classNotes, activeSubject],
  );

  useEffect(() => {
    const warm = () => {
      for (const resource of filteredNotes.slice(0, 12)) {
        router.prefetch(`/resource/${resource.slug || resource.id}`);
      }
    };
    const id = 'requestIdleCallback' in window
      ? window.requestIdleCallback(warm, { timeout: 900 })
      : window.setTimeout(warm, 250);
    return () => {
      if (typeof id === 'number') window.clearTimeout(id);
      else window.cancelIdleCallback?.(id);
    };
  }, [filteredNotes, router]);

  const chooseClass = (level: number) => {
    setSelectedClass(level);
    setSelectedSubject('');
  };

  return (
    <div className="notes-library-stack">
      <section className="notes-library-panel" aria-label="Notes library filters">
        <div className="notes-library-header">
          <div>
            <h2 className="notes-library-heading">Your subjects</h2>
            <p className="notes-library-description">Choose a subject to quickly find the notes you need.</p>
          </div>
          <span className="notes-library-class-badge">Class {selectedClass}</span>
        </div>

        <div className="notes-subject-grid" aria-label="Choose subject">
          <button
            type="button"
            onClick={() => setSelectedSubject('')}
            className={`notes-subject-card ${!activeSubject ? 'active' : ''}`}
          >
            <span className="notes-subject-art"><Art name="papers" /></span>
            <span>All</span>
            <small>{classNotes.length} {classNotes.length === 1 ? 'resource' : 'resources'}</small>
          </button>
          {availableSubjects.map((subject) => {
            const active = activeSubject === subject;
            const count = subjectCounts.get(subject) || 0;
            return (
              <button
                key={subject}
                type="button"
                onClick={() => setSelectedSubject(subject)}
                className={`notes-subject-card ${active ? 'active' : ''}`}
              >
                <span className="notes-subject-art"><Art name={subject} /></span>
                <span>{subject}</span>
                <small>{count} {count === 1 ? 'resource' : 'resources'}</small>
              </button>
            );
          })}
        </div>

        <div className="notes-class-tabs" aria-label="Choose class">
          {CLASS_CONFIG.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => chooseClass(level)}
              className={`notes-class-tab ${selectedClass === level ? 'active' : ''}`}
            >
              Class {level}
            </button>
          ))}
        </div>
      </section>

      <div className="notes-result-head">
        <div>
          <p>ARCHIVE RESULTS</p>
          <h3>{activeSubject || 'All subjects'} <span>· {filteredNotes.length}</span></h3>
        </div>
        <span className="notes-result-class">Class {selectedClass}</span>
        
      </div>

      {filteredNotes.length > 0 ? (
        <div className="notes-resource-grid">
          {filteredNotes.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <BookOpen className="w-10 h-10 mx-auto" style={{ color: 'var(--ink-faint)' }} />
          <h3 className="font-display font-bold text-lg">No notes yet for {activeSubject || 'this class'}</h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--ink-muted)' }}>The subject is available in ARCHIVUM. Check back when new material is added to the archive.</p>
          <Link href="/about" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}>
            About ARCHIVUM <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
