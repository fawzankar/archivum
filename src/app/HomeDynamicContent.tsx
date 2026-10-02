 'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStudentClass } from '@/components/StudentClassContext';
import PersonalGreeting from '@/components/PersonalGreeting';
import HomeClient from './HomeClient';
import ResourceCard from '@/components/ResourceCard';
import Art from '@/components/Art';
import StudyHub from '@/components/StudyHub';
import { ArrowRight, BookOpen, FileText, X } from 'lucide-react';
import type { RecentHomeBundle } from '@/lib/resources';

export function HomeHeroContent() {
  const { studentClass } = useStudentClass();
  const activeClass = studentClass ?? 10;
  return (
    <div className="hx-copy">
      <PersonalGreeting activeClass={activeClass} />
      <p className="hx-intro">
        Everything for Class {activeClass}, notes, past papers and study material, sorted so you can find it in seconds instead of scrolling through chats.
      </p>
      <div className="hx-search"><HomeClient /></div>
    </div>
  );
}

export default function HomeDynamicContent({ recentByClass }: { recentByClass: RecentHomeBundle }) {
  const { studentClass } = useStudentClass();
  const activeClass = studentClass ?? 10;
  const recent = recentByClass[activeClass] || [];
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedSubject) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedSubject(null); };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = previousOverflow; };
  }, [selectedSubject]);
  const subjects = activeClass <= 10
    ? ['Maths', 'Science', 'SST', 'English', 'Hindi', 'Urdu']
    : ['Maths', 'Biology', 'Physics', 'Chemistry', 'English'];

  return (
    <>
      <section className="hm-jump" aria-label="Start here">
        <Link href={`/notes?class=${activeClass}`} className="hm-jump-card hm-sun">
          <div className="hm-jump-icon"><Art name="notes" /></div>
          <div><h2>Class {activeClass} notes</h2><p>Chapter-wise notes and quick revision material, ready when you are.</p><span className="hm-pill">Open Notes</span></div>
        </Link>
        <Link href={`/previous-papers?class=${activeClass}`} className="hm-jump-card hm-peri">
          <div className="hm-jump-icon"><Art name="papers" /></div>
          <div><h2>Previous papers</h2><p>Real past papers to practise with, so exam day feels familiar.</p><span className="hm-pill">Find Papers</span></div>
        </Link>
      </section>

      <StudyHub activeClass={activeClass} />

      <section className="hm-subjects-home" aria-labelledby="hm-subjects-title">
        <div className="hm-subjects-home-head">
          <h2 id="hm-subjects-title">Pick a subject</h2>
          <span>{activeClass <= 10 ? '6 subjects' : '5 subjects'}</span>
        </div>
        <div className="hm-subjects-home-grid">
          {subjects.map((subject, index) => (
            <button key={subject} type="button" onClick={() => setSelectedSubject(subject)} className={`hm-subject-home-card subject-home-${index % 6}`} aria-haspopup="dialog">
              <span className="hm-subject-home-art"><Art name={subject} /></span>
              <strong>{subject}</strong>
            </button>
          ))}
        </div>
      </section>


      {selectedSubject && (
        <div className="subject-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSubject(null); }}>
          <section className="subject-modal" role="dialog" aria-modal="true" aria-labelledby="subject-modal-title">
            <button type="button" className="subject-modal-close" onClick={() => setSelectedSubject(null)} aria-label="Close"><X /></button>
            <span className="subject-modal-kicker">Class {activeClass} · Subject</span>
            <div className="subject-modal-icon"><Art name={selectedSubject} /></div>
            <h3 id="subject-modal-title">{selectedSubject}</h3>
            <p>What do you want to open?</p>
            <div className="subject-choice-grid">
              <Link href={`/notes?class=${activeClass}&subject=${encodeURIComponent(selectedSubject)}`} onClick={() => setSelectedSubject(null)}>
                <span><BookOpen /></span><strong>Notes</strong><small>Chapter-wise study material</small><ArrowRight />
              </Link>
              <Link href={`/previous-papers?class=${activeClass}&subject=${encodeURIComponent(selectedSubject)}`} onClick={() => setSelectedSubject(null)}>
                <span><FileText /></span><strong>PYQs</strong><small>Previous questions and papers</small><ArrowRight />
              </Link>
            </div>
          </section>
        </div>
      )}

      <section aria-labelledby="hm-recent">
        <div className="hm-head"><h2 id="hm-recent">Recently added</h2><Link href={`/search?class=${activeClass}`}>Browse all</Link></div>
        {recent.length
          ? <div className="hm-recent">{recent.map(r => <ResourceCard key={r.id} resource={r} />)}</div>
          : <div className="hm-empty"><p>Nothing new just yet. Fresh material shows up here the moment it’s added.</p></div>}
      </section>
    </>
  );
}
