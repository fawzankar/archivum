 'use client';

import React from 'react';
import Link from 'next/link';
import { useStudentClass } from '@/components/StudentClassContext';
import PersonalGreeting from '@/components/PersonalGreeting';
import HomeClient from './HomeClient';
import ResourceCard from '@/components/ResourceCard';
import Art from '@/components/Art';
import SubjectPicker from '@/components/SubjectPicker';
import { getRecentlyViewed } from '@/lib/savedStorage';
import { getReaderProgress } from '@/lib/readerState';
import { useEffect, useState } from 'react';
import type { RecentHomeBundle } from '@/lib/resources';

export function HomeHeroContent() {
  const { studentClass } = useStudentClass();
  const [profileReady, setProfileReady] = useState(false);
  useEffect(() => { setProfileReady(true); }, []);
  const activeClass = (profileReady ? studentClass : null) ?? 10;
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
  const [profileReady, setProfileReady] = useState(false);
  useEffect(() => { setProfileReady(true); }, []);
  const activeClass = (profileReady ? studentClass : null) ?? 10;
  const recent = recentByClass[activeClass] || [];
  const [recentNotes, setRecentNotes] = useState<(import('@/lib/resources').Resource & { resumeBadge?: string })[]>([]);
  useEffect(() => {
    // Recently opened notes and papers for this class, each with the page the reader will continue from.
    const sync = () => setRecentNotes(getRecentlyViewed().filter((resource) => resource.class_level === activeClass).slice(0, 4).map((resource) => {
      const progress = getReaderProgress(resource.id);
      return { ...resource, resumeBadge: progress && progress.page > 1 ? `Page ${progress.page}${progress.pages ? ` / ${progress.pages}` : ''}` : undefined };
    }));
    sync();
    window.addEventListener('sjs_recently_viewed_updated', sync);
    window.addEventListener('sjs_reader_progress_updated', sync);
    return () => { window.removeEventListener('sjs_recently_viewed_updated', sync); window.removeEventListener('sjs_reader_progress_updated', sync); };
  }, [activeClass]);
  const subjects = activeClass <= 10
    ? ['Maths', 'Science', 'SST', 'English', 'Hindi', 'Urdu']
    : ['Maths', 'Biology', 'Physics', 'Chemistry', 'English'];

  return (
    <>
      <section className="hm-jump" aria-label="Start here">
        <Link href={`/notes?class=${activeClass}`} className="hm-jump-card hm-sun">
          <div className="hm-jump-icon"><Art name="notes" /></div>
          <div><h2>Class {activeClass} Notes</h2><p>Chapter-wise notes, summaries, and revision material in one place.</p><span className="hm-pill">Open Notes</span></div>
        </Link>
        <Link href={`/previous-papers?class=${activeClass}`} className="hm-jump-card hm-peri">
          <div className="hm-jump-icon"><Art name="papers" /></div>
          <div><h2>Previous Papers</h2><p>Previous-year papers to practise, revise, and prepare with confidence.</p><span className="hm-pill">Find Papers</span></div>
        </Link>
      </section>

      <section className="hm-subjects-home" aria-labelledby="hm-subjects-title">
        <div className="hm-subjects-home-head">
          <h2 id="hm-subjects-title">Your Subjects</h2>
          <span>{activeClass <= 10 ? '6 subjects' : '5 subjects'}</span>
        </div>
        <div className="hm-subjects-home-grid">
          {subjects.map((subject, index) => (
            <div key={subject} className={`hm-subject-home-card subject-home-${index % 6}`}>
              <SubjectPicker subject={subject} classLevel={activeClass} compact />
            </div>
          ))}
        </div>
      </section>

      {recentNotes.length > 0 && (
        <section className="hm-pickup" aria-labelledby="hm-pickup-title">
          <div className="hm-head">
            <div>
              <h2 id="hm-pickup-title">Recently Opened</h2>
              <p className="hm-pickup-subtitle">Jump back in — the reader remembers your page.</p>
            </div>
          </div>
          <div className="hm-pickup-grid">
            {recentNotes.map((resource) => <ResourceCard key={`pickup-${resource.id}`} resource={resource} compact badge={resource.resumeBadge} />)}
          </div>
        </section>
      )}
      <section aria-labelledby="hm-recent">
        <div className="hm-head"><h2 id="hm-recent">Recently Added</h2></div>
        {recent.length
          ? <div className="hm-recent">{recent.map(r => <ResourceCard key={r.id} resource={r} />)}</div>
          : <div className="hm-empty"><p>No new material yet. Fresh resources will appear here as soon as they are added to the archive.</p></div>}
      </section>
    </>
  );
}
