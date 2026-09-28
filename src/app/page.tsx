import React from 'react';
import Link from 'next/link';
import { getResources } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import { ArrowRight, BookOpen, FileText } from 'lucide-react';
import SubjectPicker from '@/components/SubjectPicker';
import { subjectsForClass, SUBJECT_DETAILS } from '@/lib/subjects';
import PersonalGreeting from '@/components/PersonalGreeting';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requestedClass = params.class ? Number(params.class) : undefined;
  const activeClass = [9,10,11,12].includes(requestedClass || 0) ? requestedClass as number : preferred || 10;
  let recent = { items: [] as Awaited<ReturnType<typeof getResources>>['items'] };
  try { recent = await getResources({ sortBy: 'newest', class_level: activeClass, limit: 6 }); } catch { recent = { items: [] }; }
  const subjects = subjectsForClass(activeClass);

  return <div className="app-home pb-16">
    <section className="home-hero">
      <div className="archive-shell home-hero-grid">
        <div className="home-hero-copy">
          <div className="home-greeting"><PersonalGreeting activeClass={activeClass} /></div>
          <div className="home-search"><HomeClient /></div>
          <div className="home-links"><Link href={`/notes?class=${activeClass}`}><BookOpen/> Notes <ArrowRight/></Link><Link href={`/previous-papers?class=${activeClass}`}><FileText/> Previous papers <ArrowRight/></Link></div>
        </div>
        <aside className="home-subjects">
          <div className="home-subjects-head"><h2>Your subjects</h2><span>{subjects.length}</span></div>
          <div className="home-subject-list">
            {subjects.map(subject => <SubjectPicker key={subject} subject={subject} classLevel={activeClass} description={SUBJECT_DETAILS[subject]?.description} compact/>)}
          </div>
        </aside>
      </div>
    </section>

    <main className="archive-shell home-main">
      <section className="home-recent">
        <div className="home-section-head"><div><h2>Recently added</h2><p>A few things that have landed in your class archive.</p></div><Link href={`/search?class=${activeClass}`}>See everything <ArrowRight/></Link></div>
        {recent.items.length ? <div className="home-resource-list">{recent.items.map(r => <ResourceCard key={r.id} resource={r}/>)}</div> : <div className="home-empty">New material will show up here as it is added.</div>}
      </section>
    </main>
  </div>;
}
