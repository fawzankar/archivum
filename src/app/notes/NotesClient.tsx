'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import ResourceCard from '@/components/ResourceCard';
import { BookOpen, ArrowRight, Layers3 } from 'lucide-react';
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
  const [selectedClass, setSelectedClass] = useState<number>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || '');
  const [notes, setNotes] = useState<Resource[]>(() => mergeUnique(allNotes));
  const [loading, setLoading] = useState(false);
  const loadedClasses = useRef(new Set<number>([initialClass]));

  useEffect(() => {
    if (loadedClasses.current.has(selectedClass)) return;

    const cached = classCache.get(selectedClass);
    if (cached) {
      loadedClasses.current.add(selectedClass);
      setNotes((current) => mergeUnique([...current, ...cached]));
      return;
    }

    loadedClasses.current.add(selectedClass);
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/resources?class=${selectedClass}&type=Notes&limit=40`, {
      cache: 'force-cache',
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Could not load notes')))
      .then((json) => {
        if (cancelled) return;
        const incoming = Array.isArray(json.items) ? mergeUnique(json.items) : [];
        classCache.set(selectedClass, incoming);
        setNotes((current) => mergeUnique([...current, ...incoming]));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedClass]);

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

  const chooseClass = (level: number) => {
    setSelectedClass(level);
    setSelectedSubject('');
  };

  return (
    <div className="notes-library-stack">
      <section className="notes-library-panel" aria-label="Notes library filters">
        <div className="notes-library-header">
          <div>
            <span className="notes-library-label">CLASS {selectedClass} · NOTES LIBRARY</span>
            <h2 className="notes-library-heading">Choose a subject</h2>
            <p className="notes-library-description">Your class profile controls the subject list, so you only see what applies to you.</p>
          </div>
          <Layers3 className="notes-library-icon" aria-hidden="true" />
        </div>

        <div className="notes-subject-grid" aria-label="Choose subject">
          <button
            type="button"
            onClick={() => setSelectedSubject('')}
            className={`notes-subject-card ${!activeSubject ? 'active' : ''}`}
          >
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
        {loading && <span className="notes-fast-loading" role="status">Loading…</span>}
      </div>

      {filteredNotes.length > 0 ? (
        <div className="notes-resource-grid">
          {filteredNotes.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
        </div>
      ) : loading ? (
        <div className="notes-centered-loading" role="status">
          <strong>Loading notes…</strong>
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
