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
      <section className="hero-editorial pt-4 sm:pt-8">
        <div className="archive-shell relative py-10 sm:py-14 lg:py-16">
          <div className="max-w-5xl animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold" style={{background:'var(--accent-light)',color:'var(--accent)'}}>
              <Sparkles className="w-3.5 h-3.5" /> CLASS {activeClass} SPACE
            </div>
            <PersonalGreeting activeClass={activeClass} />
            <div className="hero-accent-rule mt-6" />
            <h1 className="font-display text-[3rem] sm:text-6xl lg:text-[5.4rem] leading-[.95] tracking-[-.055em] mt-6" style={{color:'var(--hero-ink)'}}>
              Study smarter.<br />Find what you need.
            </h1>
            <p className="max-w-2xl mt-5 text-sm sm:text-base leading-7" style={{color:'var(--hero-muted)'}}>
              A lively student community for notes, previous papers, chapter material and practical exam help — organised around your class.
            </p>
            <div className="mt-7 max-w-2xl"><HomeClient /></div>
          </div>
        </div>
      </section>

      <main className="archive-shell">
        <section className="py-7 sm:py-9 border-b" style={{borderColor:'var(--border)'}}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[.16em] font-bold" style={{color:'var(--accent)'}}>Quick start</span>
              <h2 className="font-display text-2xl sm:text-3xl mt-1">What are you here for?</h2>
            </div>
            <Link href={`/tips?class=${activeClass}`} className="inline-flex items-center gap-1.5 text-xs font-bold" style={{color:'var(--accent)'}}>See tips <ArrowRight className="w-3.5 h-3.5"/></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              ['Notes','Chapter-wise revision',BookOpen,`/notes?class=${activeClass}`],
              ['Papers','Past exam practice',FileText,`/previous-papers?class=${activeClass}`],
              ['Tips','Practical exam help',Lightbulb,`/tips?class=${activeClass}`],
              ['Upload','Share with classmates',Upload,'/upload'],
            ].map(([title,desc,Icon,href],i) => (
              <Link key={title as string} href={href as string} className="group rounded-2xl border p-5 min-h-[140px] flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg" style={{borderColor:'var(--border)', background:i===3?'var(--accent)':'var(--surface)', color:i===3?'var(--accent-contrast)':'var(--ink)'}}>
                <div className="flex items-center justify-between"><span className="w-9 h-9 rounded-xl grid place-items-center" style={{background:i===3?'rgba(255,255,255,.18)':'var(--accent-light)',color:i===3?'inherit':'var(--accent)'}}><Icon className="w-4 h-4" /></span><ArrowRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" /></div>
                <div><div className="font-display text-lg">{title as string}</div><div className="text-[11px] mt-1" style={{color:i===3?'rgba(255,255,255,.75)':'var(--ink-muted)'}}>{desc as string}</div></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-7 sm:py-9 border-b" style={{borderColor:'var(--border)'}}>
          <div className="flex items-end justify-between gap-5">
            <div><span className="text-[10px] uppercase tracking-[.16em] font-bold" style={{color:'var(--accent)'}}>Class {activeClass}</span><h2 className="font-display text-2xl sm:text-3xl mt-1">Browse by subject.</h2><p className="text-sm mt-1.5" style={{color:'var(--ink-muted)'}}>Tap a subject, then choose Notes or PYQs.</p></div>
            <Link href={`/subjects?class=${activeClass}`} className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold" style={{color:'var(--accent)'}}>All subjects <ArrowRight className="w-3.5 h-3.5"/></Link>
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {subjects.map(subject => <SubjectPicker key={subject} subject={subject} classLevel={activeClass} description={SUBJECT_DETAILS[subject]?.description} />)}
          </div>
        </section>

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
