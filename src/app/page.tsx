import React from 'react';
import Link from 'next/link';
import { getResources } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import Art from '@/components/Art';
import HomeClient from './HomeClient';
import PersonalGreeting from '@/components/PersonalGreeting';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requested = params.class ? Number(params.class) : undefined;
  const activeClass = [9, 10, 11, 12].includes(requested || 0) ? (requested as number) : preferred || 10;
  let recent: Awaited<ReturnType<typeof getResources>>['items'] = [];
  try {
    recent = (await getResources({ sortBy: 'newest', class_level: activeClass, limit: 6 })).items;
  } catch { recent = []; }

  return <div className="hm">
    <div className="hm-shell">
      <header className="hm-top home-hero-panel">
        <div className="hero-zebra" aria-hidden="true">
          <span className="hero-zebra-layer" />
          <span className="hero-zebra-glow" />
          <span className="hero-illustration hero-illustration-one" />
          <span className="hero-illustration hero-illustration-two" />
          <span className="hero-illustration hero-illustration-three" />
        </div>
        <div className="home-hero-copy">
          <PersonalGreeting activeClass={activeClass} />
          <p className="home-hero-intro">Your Class {activeClass} notes, previous year papers and study material, all organised in one place so you can easily find exactly what you need.</p>
          <div className="hm-search"><HomeClient /></div>
        </div>
      </header>

      <section className="hm-jump" aria-label="Start here">
        <Link href={`/notes?class=${activeClass}`} className="hm-jump-card hm-sun">
          <div className="hm-jump-icon"><Art name="notes" /></div><div><h2>Class {activeClass} notes</h2><p>Chapter based study material, kept in one place.</p><span className="hm-pill">Open Notes</span></div>
        </Link>
        <Link href={`/previous-papers?class=${activeClass}`} className="hm-jump-card hm-peri">
          <div className="hm-jump-icon"><Art name="papers" /></div><div><h2>Previous papers</h2><p>Practise with real question papers.</p><span className="hm-pill">Find Papers</span></div>
        </Link>
      </section>

      <section className="hm-subjects-home" aria-labelledby="hm-subjects-title">
        <div className="hm-subjects-home-head">
          <h2 id="hm-subjects-title">Your subjects</h2>
          <span>{activeClass <= 10 ? '6 subjects' : '5 subjects'}</span>
        </div>
        <div className="hm-subjects-home-grid">
          {(activeClass <= 10
            ? ['Maths', 'Science', 'SST', 'English', 'Hindi', 'Urdu']
            : ['Maths', 'Biology', 'Physics', 'Chemistry', 'English']
          ).map((subject, index) => (
            <Link
              key={subject}
              href={`/notes?class=${activeClass}&subject=${encodeURIComponent(subject)}`}
              className={`hm-subject-home-card subject-home-${index % 6}`}
            >
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
          : <div className="hm-empty"><p>Nothing here yet. New material shows up as soon as it’s approved.</p></div>}
      </section>
    </div>
  </div>;
}
