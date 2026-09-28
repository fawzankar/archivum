import React from 'react';
import Link from 'next/link';
import { getResources } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import { ArrowRight, BookOpen, FileText, Lightbulb, Upload, Sparkles } from 'lucide-react';
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
  try { recent = await getResources({ sortBy: 'newest', class_level: activeClass, limit: 3 }); } catch { recent = { items: [] }; }
  const subjects = subjectsForClass(activeClass);

  return <div className="spatial-app pb-20">
    <section className="spatial-hero">
      <div className="archive-shell py-4 sm:py-6 lg:py-8">
        <div className="spatial-hero-grid">
          <div className="spatial-hero-main animate-rise">
            <div className="spatial-grid-lines" aria-hidden="true" />
            <div className="spatial-hero-top"><span className="spatial-live"><span/> CLASS {activeClass}</span><span className="spatial-chip"><Sparkles/> Personal space</span></div>
            <div className="spatial-greeting"><PersonalGreeting activeClass={activeClass} /></div>
            <h1>Study without the<br/><span>friction.</span></h1>
            <p>Notes, papers and useful material for your class — organized so you can get to the page you need quickly.</p>
            <div className="spatial-search"><HomeClient /></div>
            <div className="spatial-quick-row"><Link href={`/notes?class=${activeClass}`}><BookOpen/> Notes</Link><Link href={`/previous-papers?class=${activeClass}`}><FileText/> Papers</Link><Link href="/upload"><Upload/> Upload</Link></div>
            <div className="spatial-depth-card depth-one"/><div className="spatial-depth-card depth-two"/>
          </div>

          <aside className="spatial-subjects">
            <div className="spatial-subjects-head"><div><span>CLASS {activeClass}</span><h2>Your subjects</h2></div><strong>{subjects.length}</strong></div>
            <div className="spatial-subject-stack">
              {subjects.map((subject, index) => <div key={subject} className="spatial-subject-wrap" style={{'--i': index} as React.CSSProperties}><SubjectPicker subject={subject} classLevel={activeClass} description={SUBJECT_DETAILS[subject]?.description} compact/></div>)}
            </div>
            <div className="spatial-subject-foot"><span>Tap a subject</span><span>Notes or PYQs</span></div>
          </aside>
        </div>
      </div>
    </section>

    <main className="archive-shell">
      <section className="spatial-actions-section">
        <div className="spatial-section-head"><div><span>QUICK ACCESS</span><h2>Pick up where you left off.</h2></div><Link href={`/tips?class=${activeClass}`}>Study tips <ArrowRight/></Link></div>
        <div className="spatial-action-grid">
          {[["Notes","Chapter-wise revision",BookOpen,`/notes?class=${activeClass}`],["Papers","Past exam practice",FileText,`/previous-papers?class=${activeClass}`],["Tips","Practical exam help",Lightbulb,`/tips?class=${activeClass}`],["Upload","Share with classmates",Upload,'/upload']].map(([title,desc,Icon,href],i)=><Link key={title as string} href={href as string} className={`spatial-action-card action-${i}`}><span className="action-icon"><Icon/></span><span className="action-copy"><strong>{title as string}</strong><small>{desc as string}</small></span><ArrowRight className="action-arrow"/></Link>)}
        </div>
      </section>

      <section className="spatial-recent">
        <div className="spatial-section-head"><div><span>JUST ADDED</span><h2>Fresh resources.</h2></div><Link href={`/search?class=${activeClass}`}>View all <ArrowRight/></Link></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{recent.items.map(r=><ResourceCard key={r.id} resource={r}/>)}</div>
      </section>
    </main>
  </div>;
}
