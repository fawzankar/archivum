'use client';

import React, { useState, useMemo } from 'react';
import { Resource } from '@/lib/resources';
import ResourceCard from '@/components/ResourceCard';
import PdfViewerModal from '@/components/PdfViewerModal';
import { BookOpen, FolderOpen, ArrowRight } from 'lucide-react';

interface NotesClientProps {
  allNotes: Resource[];
  initialClass: number;
  initialSubject: string;
}

const CLASS_CONFIG = [
  { level: 9, colorClass: 'pastel-block-peach', label: 'Class 9' },
  { level: 10, colorClass: 'pastel-block-sky', label: 'Class 10' },
  { level: 11, colorClass: 'pastel-block-lavender', label: 'Class 11' },
  { level: 12, colorClass: 'pastel-block-yellow', label: 'Class 12' },
];

export default function NotesClient({ allNotes, initialClass, initialSubject }: NotesClientProps) {
  const [selectedClass, setSelectedClass] = useState<number>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || '');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [activePdf, setActivePdf] = useState<Resource | null>(null);

  const classNotes = useMemo(() => {
    return allNotes.filter((n) => n.class_level === selectedClass);
  }, [allNotes, selectedClass]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    classNotes.forEach((n) => {
      if (n.subject) set.add(n.subject);
    });
    return Array.from(set);
  }, [classNotes]);

  const activeSubject = selectedSubject && availableSubjects.includes(selectedSubject)
    ? selectedSubject
    : availableSubjects[0] || '';

  const subjectNotes = useMemo(() => {
    if (!activeSubject) return classNotes;
    return classNotes.filter((n) => n.subject.toLowerCase() === activeSubject.toLowerCase());
  }, [classNotes, activeSubject]);

  const availableChapters = useMemo(() => {
    const set = new Set<string>();
    subjectNotes.forEach((n) => {
      if (n.chapter) set.add(n.chapter);
    });
    return Array.from(set);
  }, [subjectNotes]);

  const filteredNotes = useMemo(() => {
    if (!selectedChapter) return subjectNotes;
    return subjectNotes.filter((n) => n.chapter?.toLowerCase() === selectedChapter.toLowerCase());
  }, [subjectNotes, selectedChapter]);

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      
      {/* 1. Class Selector Horizontal Blocks (Theme Adaptive + Touch App Feel) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CLASS_CONFIG.map((c) => {
          const isSelected = selectedClass === c.level;
          return (
            <button
              key={c.level}
              type="button"
              onClick={() => {
                setSelectedClass(c.level);
                setSelectedSubject('');
                setSelectedChapter('');
              }}
              className={`p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border ${c.colorClass} app-touch-active`}
              style={{
                borderColor: isSelected ? 'var(--ink)' : 'var(--border)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <span className="font-display font-bold text-2xl">
                {c.level}
              </span>
              <div className="flex items-center justify-between text-xs font-semibold mt-3">
                <span>{c.label} notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Subject Pills (Horizontal touch scroll on mobile) */}
      {availableSubjects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => {
              setSelectedSubject('');
              setSelectedChapter('');
            }}
            className="px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer app-touch-active"
            style={{
              backgroundColor: !selectedSubject ? 'var(--ink)' : 'var(--surface)',
              color: !selectedSubject ? 'var(--surface)' : 'var(--ink-muted)',
              border: '1px solid var(--border)',
            }}
          >
            All Subjects ({classNotes.length})
          </button>
          {availableSubjects.map((sub) => {
            const isSubActive = activeSubject === sub && selectedSubject === sub;
            return (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubject(sub);
                  setSelectedChapter('');
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer app-touch-active"
                style={{
                  backgroundColor: isSubActive ? 'var(--sage)' : 'var(--surface)',
                  color: isSubActive ? '#fff' : 'var(--ink-muted)',
                  border: isSubActive ? '1px solid var(--sage)' : '1px solid var(--border)',
                }}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Chapter Pills */}
      {availableChapters.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 p-3 sm:p-4 rounded-2xl border"
          style={{
            backgroundColor: 'var(--surface-raised)',
            borderColor: 'var(--border)',
          }}
        >
          <span className="text-xs font-semibold mr-1 flex items-center gap-1.5" style={{ color: 'var(--ink-muted)' }}>
            <FolderOpen className="w-3.5 h-3.5" style={{ color: 'var(--sage)' }} />
            Chapter:
          </span>
          <button
            onClick={() => setSelectedChapter('')}
            className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            style={{
              backgroundColor: !selectedChapter ? 'var(--ink)' : 'transparent',
              color: !selectedChapter ? 'var(--surface)' : 'var(--ink-muted)',
            }}
          >
            All
          </button>
          {availableChapters.map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChapter(ch)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              style={{
                backgroundColor: selectedChapter === ch ? 'var(--ink)' : 'transparent',
                color: selectedChapter === ch ? 'var(--surface)' : 'var(--ink-muted)',
              }}
            >
              {ch}
            </button>
          ))}
        </div>
      )}

      {/* 4. Notes Cards Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredNotes.map((r) => (
            <ResourceCard key={r.id} resource={r} onView={(res) => setActivePdf(res)} />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-16 rounded-3xl border space-y-3"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <BookOpen className="w-10 h-10 mx-auto" style={{ color: 'var(--ink-faint)' }} />
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--ink)' }}>
            No notes available in this chapter
          </h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--ink-muted)' }}>
            Be the first student to upload notes for Class {selectedClass} {selectedSubject}!
          </p>
        </div>
      )}

      {/* PDF Modal Viewer */}
      <PdfViewerModal resource={activePdf} onClose={() => setActivePdf(null)} />
    </div>
  );
}
