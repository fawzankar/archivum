import React from 'react';
import Link from 'next/link';
import { getResources } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import { ArrowRight, BookOpen, Clock3, FlaskConical, Globe2, Languages, Leaf, Atom, Beaker } from 'lucide-react';
import { subjectsForClass, SUBJECT_DETAILS } from '@/lib/subjects';
import PersonalGreeting from '@/components/PersonalGreeting';
import SubjectPicker from '@/components/SubjectPicker';

export const revalidate = 30;

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requestedClass = params.class ? Number(params.class) : undefined;
  const activeClass = [9,10,11,12].includes(requestedClass || 0) ? requestedClass as number : preferred || 10;
  const [recent] = await Promise.all([getResources({ sortBy: 'newest', class_level: activeClass, limit: 3 })]);
  const subjects = subjectsForClass(activeClass);

  return (
    <div className="pb-20">
      <section className="hero-app">
        <div className="archive-shell py-5 sm:py-7 lg:py-9">
          <div className="hero-app-grid">
            <div className="hero-app-main animate-rise">
              <div className="hero-app-topline">
                <span className="hero-app-status"><span className="hero-app-status-dot" /> Class {activeClass}</span>
                <span className="hero-app-topline-copy"><Clock3 className="w-3.5 h-3.5" /> Study library</span>
              </div>
              <PersonalGreeting activeClass={activeClass} />
              <h1 className="hero-app-title">Everything you need to<br className="hidden sm:block" /> study, in one place.</h1>
              <p className="hero-app-copy">Find notes, previous papers, tips and useful material without digging through chats or folders.</p>
              <div className="hero-app-search"><HomeClient /></div>
            </div>

            <aside className="hero-app-side">
              <div className="hero-app-side-head">
                <div><span className="hero-side-label">YOUR SUBJECTS</span><strong>Class {activeClass}</strong></div>
                <span className="hero-side-mark"><BookOpen className="w-4 h-4" /></span>
              </div>
              <div className="hero-subject-grid">
                {subjects.map((subject) => {
                  const Icon = ({
                    Maths: BookOpen, Science: FlaskConical, SST: Globe2, English: Languages, Hindi: Languages, Urdu: Languages, Biology: Leaf, Physics: Atom, Chemistry: Beaker
                  } as Record<string, React.ElementType>)[subject] || BookOpen;
                  return <SubjectPicker key={subject} subject={subject} classLevel={activeClass} description={SUBJECT_DETAILS[subject]?.description} compact Icon={Icon} />;
                })}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <main className="archive-shell">
        <section className="py-7 sm:py-9">
          <div className="flex items-end justify-between gap-5">
            <div><span className="text-[10px] uppercase tracking-[.16em] font-bold" style={{color:'var(--accent)'}}>New</span><h2 className="font-display text-2xl sm:text-3xl mt-1">Fresh into the archive.</h2></div>
            <Link href={`/search?class=${activeClass}`} className="inline-flex items-center gap-1.5 text-xs font-bold" style={{color:'var(--accent)'}}>Explore all <ArrowRight className="w-3.5 h-3.5"/></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{recent.items.map(r => <ResourceCard key={r.id} resource={r}/>)}</div>
        </section>
      </main>
    </div>
  );
}
