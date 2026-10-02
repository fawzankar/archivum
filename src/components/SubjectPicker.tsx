'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Art from './Art';
import { ArrowUpRight, BookOpen, Calculator, FlaskConical, Globe2, Languages, Leaf, Atom, Beaker, X, FileText } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Maths: Calculator, Science: FlaskConical, SST: Globe2, English: Languages,
  Hindi: Languages, Urdu: Languages, Biology: Leaf, Physics: Atom, Chemistry: Beaker,
};

export default function SubjectPicker({ subject, classLevel, description, compact = false }: { subject: string; classLevel: number; description?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const go = (kind: 'notes' | 'papers') => {
    setOpen(false);
    const base = kind === 'notes' ? '/notes' : '/previous-papers';
    router.push(`${base}?class=${classLevel}&subject=${encodeURIComponent(subject)}`);
  };

  const modal = open && typeof document !== 'undefined' ? createPortal(
    <div className="subject-modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <div className="subject-modal" role="dialog" aria-modal="true" aria-labelledby={`subject-${classLevel}-${subject}`} onMouseDown={e => e.stopPropagation()}>
        <button type="button" className="subject-modal-close" onClick={() => setOpen(false)} aria-label="Close"><X /></button>
        <div className="subject-modal-art"><Art name={subject} /></div>
        <h3 id={`subject-${classLevel}-${subject}`}>{subject}</h3>
        <p>Choose what you want to study.</p>
        <div className="subject-choice-grid">
          <button type="button" onClick={() => go('notes')}>
            <span><BookOpen /></span><strong>Notes</strong><small>Chapter-wise study material</small><ArrowUpRight />
          </button>
          <button type="button" onClick={() => go('papers')}>
            <span><FileText /></span><strong>PYQs</strong><small>Previous question papers</small><ArrowUpRight />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;

  return <>
    <button type="button" onClick={() => setOpen(true)} className={`subject-tile group ${compact ? 'subject-tile-compact' : ''}`} aria-label={`Open ${subject} resources`}>
      <Art name={subject} className="subject-tile-art" />
      <span className="subject-tile-copy"><strong>{subject}</strong>{description && <small>{description}</small>}</span>
      <ArrowUpRight className="subject-tile-arrow" aria-hidden="true" />
    </button>
    {modal}
  </>;
}
