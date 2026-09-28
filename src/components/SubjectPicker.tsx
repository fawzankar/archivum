'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, BookOpen, Calculator, FlaskConical, Globe2, Languages, Leaf, Atom, Beaker, X, FileText } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Maths: Calculator, Science: FlaskConical, SST: Globe2, English: Languages,
  Hindi: Languages, Urdu: Languages, Biology: Leaf, Physics: Atom, Chemistry: Beaker,
};

export default function SubjectPicker({ subject, classLevel, description, compact = false }: { subject: string; classLevel: number; description?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const Icon = iconMap[subject] || BookOpen;
  const go = (kind: 'notes' | 'papers') => {
    setOpen(false);
    const base = kind === 'notes' ? '/notes' : '/previous-papers';
    router.push(`${base}?class=${classLevel}&subject=${encodeURIComponent(subject)}`);
  };

  return <>
    <button type="button" onClick={() => setOpen(true)} className={`subject-tile group ${compact ? 'subject-tile-compact' : ''}`} aria-label={`Open ${subject} resources`}>
      <span className="subject-tile-mark"><Icon /></span>
      <span className="subject-tile-copy"><strong>{subject}</strong>{description && <small>{description}</small>}</span>
      <ArrowUpRight className="subject-tile-arrow" />
    </button>
    {open && <div className="subject-modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <div className="subject-modal" role="dialog" aria-modal="true" aria-labelledby={`subject-${classLevel}-${subject}`} onMouseDown={e => e.stopPropagation()}>
        <button className="subject-modal-close" onClick={() => setOpen(false)} aria-label="Close"><X /></button>
        <div className="subject-modal-kicker">CLASS {classLevel} / SUBJECT</div>
        <div className="subject-modal-icon"><Icon /></div>
        <h3 id={`subject-${classLevel}-${subject}`}>{subject}</h3>
        <p>What are you looking for?</p>
        <div className="subject-choice-grid">
          <button onClick={() => go('notes')}><span><BookOpen /></span><strong>Notes</strong><small>Chapter-wise study material</small><ArrowUpRight /></button>
          <button onClick={() => go('papers')}><span><FileText /></span><strong>PYQs</strong><small>Previous question papers</small><ArrowUpRight /></button>
        </div>
      </div>
    </div>}
  </>;
}
