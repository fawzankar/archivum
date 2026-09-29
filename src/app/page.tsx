import React from 'react';
import Link from 'next/link';
import { getResources } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import { ArrowRight, BookOpen, FileText, Bookmark, Lightbulb } from 'lucide-react';
import SubjectPicker from '@/components/SubjectPicker';
import { subjectsForClass, SUBJECT_DETAILS } from '@/lib/subjects';
import PersonalGreeting from '@/components/PersonalGreeting';
import ArchiveIllustration from '@/components/ArchiveIllustration';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requestedClass = params.class ? Number(params.class) : undefined;
  const activeClass = [9,10,11,12].includes(requestedClass || 0) ? requestedClass as number : preferred || 10;
  let recent = { items: [] as Awaited<ReturnType<typeof getResources>>['items'] };
  try { recent = await getResources({ sortBy: 'newest', class_level: activeClass, limit: 6 }); } catch {}
  const subjects = subjectsForClass(activeClass);

  return <div className="illustrated-app">
    <section className="home-stage">
      <div className="archive-shell home-stage-grid">
        <div className="home-stage-copy">
          <div className="paper-kicker"><span>ARCHIVUM</span><i/> CLASS {activeClass}</div>
          <div className="home-greeting"><PersonalGreeting activeClass={activeClass} /></div>
          <h1>Everything you need to <em>study well.</em></h1>
          <p className="home-lede">Notes, papers, tips and saved material for Class {activeClass}. One quiet place for the things you actually use.</p>
          <HomeClient />
          <div className="home-entry-row">
            <Link href={`/notes?class=${activeClass}`} className="entry-tile entry-yellow"><span className="entry-icon"><BookOpen/></span><span><b>Notes</b><small>Chapter-wise material</small></span><ArrowRight/></Link>
            <Link href={`/previous-papers?class=${activeClass}`} className="entry-tile entry-blue"><span className="entry-icon"><FileText/></span><span><b>Previous papers</b><small>Past exams & practice</small></span><ArrowRight/></Link>
            <Link href="/saved" className="entry-tile entry-pink"><span className="entry-icon"><Bookmark/></span><span><b>Saved</b><small>Your personal shelf</small></span><ArrowRight/></Link>
          </div>
        </div>
        <div className="home-art-wrap"><ArchiveIllustration/><div className="art-caption"><span>FIELD NOTE 09</span><b>KEEP THE<br/>GOOD STUFF.</b></div></div>
      </div>
    </section>

    <div className="archive-shell home-content">
      <section className="subject-board">
        <div className="board-label"><span>01</span><div><b>THE SUBJECT DESK</b><small>Choose a subject and open its notes or papers.</small></div><span className="board-rule"/></div>
        <div className="subject-board-grid">
          {subjects.map((subject, i) => <div key={subject} className={`subject-paper subject-paper-${i%5}`}><SubjectPicker subject={subject} classLevel={activeClass} description={SUBJECT_DETAILS[subject]?.description}/></div>)}
        </div>
      </section>

      <section className="recent-board">
        <div className="section-ribbon"><span>02</span><b>RECENTLY ADDED</b><small>Fresh material in your class archive</small><Link href={`/search?class=${activeClass}`}>Browse all <ArrowRight/></Link></div>
        {recent.items.length ? <div className="resource-mosaic">{recent.items.map((r,i)=><div key={r.id} className={`mosaic-item mosaic-${i%4}`}><ResourceCard resource={r}/></div>)}</div> : <div className="archive-empty"><Lightbulb/><div><b>The shelf is waiting.</b><span>New material will appear here as it is added.</span></div></div>}
      </section>
    </div>
  </div>;
}
