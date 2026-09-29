import React from 'react';
import { BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import { getResources } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import SubjectPicker from '@/components/SubjectPicker';
import PersonalGreeting from '@/components/PersonalGreeting';
import ArchiveIllustration from '@/components/ArchiveIllustration';
import { subjectsForClass, SUBJECT_DETAILS } from '@/lib/subjects';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requested = params.class ? Number(params.class) : undefined;
  const activeClass = [9, 10, 11, 12].includes(requested || 0) ? (requested as number) : preferred || 10;
  let recent: Awaited<ReturnType<typeof getResources>>['items'] = [];
  try { recent = (await getResources({ sortBy: 'newest', class_level: activeClass, limit: 6 })).items; } catch { recent = []; }
  const subjects = subjectsForClass(activeClass);

  return <div className="hm">
    <div className="hm-shell">
      <header className="hm-top home-hero-panel">
        <div className="home-hero-drawing"><ArchiveIllustration /></div>
        <div className="home-hero-copy">
          <PersonalGreeting activeClass={activeClass} />
          <p className="home-hero-intro">Your Class {activeClass} notes, previous-year papers and study material — organised so you can find what you need without digging through old chats.</p>
          <div className="hm-search"><HomeClient /></div>
        </div>
      </header>

      <section className="hm-jump" aria-label="Start here">
        <Link href={`/notes?class=${activeClass}`} className="hm-jump-card hm-sun">
          <div className="hm-jump-icon"><BookOpen aria-hidden="true" /></div><div><h2>Class {activeClass} notes</h2><p>Chapter-wise study material, kept in one place.</p><span className="hm-pill">Open notes</span></div>
        </Link>
        <Link href={`/previous-papers?class=${activeClass}`} className="hm-jump-card hm-peri">
          <div className="hm-jump-icon"><FileText aria-hidden="true" /></div><div><h2>Previous papers</h2><p>Practise with real question papers.</p><span className="hm-pill">Find papers</span></div>
        </Link>
      </section>

      <section aria-labelledby="hm-subjects">
        <div className="hm-head"><h2 id="hm-subjects">Your subjects</h2><span>{subjects.length} subjects</span></div>
        <div className="hm-grid">
          {subjects.map(s => <SubjectPicker key={s} subject={s} classLevel={activeClass} description={SUBJECT_DETAILS[s]?.description} compact />)}
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
