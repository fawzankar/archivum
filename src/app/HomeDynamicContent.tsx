 'use client';

import React from 'react';
import Link from 'next/link';
import { useStudentClass } from '@/components/StudentClassContext';
import PersonalGreeting from '@/components/PersonalGreeting';
import HomeClient from './HomeClient';
import ResourceCard from '@/components/ResourceCard';
import Art from '@/components/Art';
import type { RecentHomeBundle } from '@/lib/resources';

export function HomeHeroContent() {
  const { studentClass } = useStudentClass();
  const activeClass = studentClass ?? 10;
  return (
    <div className="hx-copy">
      <PersonalGreeting activeClass={activeClass} />
      <p className="hx-intro">
        Your Class {activeClass} notes, previous-year papers, and study material — neatly organised so you can find what you need without digging through folders.
      </p>
      <div className="hx-search"><HomeClient /></div>
    </div>
  );
}

export default function HomeDynamicContent({ recentByClass }: { recentByClass: RecentHomeBundle }) {
  const { studentClass } = useStudentClass();
  const activeClass = studentClass ?? 10;
  const recent = recentByClass[activeClass] || [];
  const subjects = activeClass <= 10
    ? ['Maths', 'Science', 'SST', 'English', 'Hindi', 'Urdu']
    : ['Maths', 'Biology', 'Physics', 'Chemistry', 'English'];

  return (
    <>
      <section className="hm-jump" aria-label="Start here">
        <Link href={`/notes?class=${activeClass}`} className="hm-jump-card hm-sun">
          <div className="hm-jump-icon"><Art name="notes" /></div>
          <div><h2>Class {activeClass} notes</h2><p>Chapter-wise notes, summaries, and revision material in one place.</p><span className="hm-pill">Open Notes</span></div>
        </Link>
        <Link href={`/previous-papers?class=${activeClass}`} className="hm-jump-card hm-peri">
          <div className="hm-jump-icon"><Art name="papers" /></div>
          <div><h2>Previous papers</h2><p>Previous-year papers to practise, revise, and prepare with confidence.</p><span className="hm-pill">Find Papers</span></div>
        </Link>
      </section>

      <section className="hm-subjects-home" aria-labelledby="hm-subjects-title">
        <div className="hm-subjects-home-head">
          <h2 id="hm-subjects-title">Your subjects</h2>
          <span>{activeClass <= 10 ? '6 subjects' : '5 subjects'}</span>
        </div>
        <div className="hm-subjects-home-grid">
          {subjects.map((subject, index) => (
            <Link key={subject} href={`/notes?class=${activeClass}&subject=${encodeURIComponent(subject)}`} className={`hm-subject-home-card subject-home-${index % 6}`}>
              <div className="hm-subject-home-art"><Art name={subject} /></div>
              <strong>{subject}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="hm-recent">
        <div className="hm-head"><h2 id="hm-recent">Recently added</h2><Link href={`/search?class=${activeClass}`}>See everything</Link></div>
        {recent.length
          ? <div className="hm-recent">{recent.map(r => <ResourceCard key={r.id} resource={r} />)}</div>
          : <div className="hm-empty"><p>No new material yet. Fresh resources will appear here as soon as they are added to the archive.</p></div>}
      </section>
    </>
  );
}
