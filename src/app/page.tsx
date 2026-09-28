import React from 'react';
import Link from 'next/link';
import { getResources } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import { ArrowRight, BookOpen, FileText, Lightbulb, Upload } from 'lucide-react';
import SubjectPicker from '@/components/SubjectPicker';
import { subjectsForClass, SUBJECT_DETAILS } from '@/lib/subjects';
import PersonalGreeting from '@/components/PersonalGreeting';

export const revalidate = 30;

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requestedClass = params.class ? Number(params.class) : undefined;
  const activeClass = [9,10,11,12].includes(requestedClass || 0) ? requestedClass as number : preferred || 10;

  const [recent] = await Promise.all([
    getResources({ sortBy: 'newest', class_level: activeClass, limit: 3 }),
  ]);

  const subjects = subjectsForClass(activeClass);

  return (
    <div className="pb-24">
      <section className="hero-editorial -mt-[68px] pt-[68px] sm:-mt-[76px] sm:pt-[76px]">
        <div className="archive-shell relative py-11 sm:py-14 lg:py-18">
          <div className="max-w-3xl animate-rise">
            <div className="hero-kicker">ARCHIVUM / CLASS {activeClass}</div>
            <PersonalGreeting activeClass={activeClass} />
            <div className="hero-accent-rule mt-4" />
            <h1 className="font-display text-[3.2rem] sm:text-6xl lg:text-[5.7rem] leading-[.98] tracking-[-.055em] mt-6" style={{color:'var(--hero-ink)'}}>
              The study archive<br />
              <span style={{color:'var(--accent-on-hero)'}}>made useful.</span>
            </h1>
            <p className="max-w-xl mt-6 text-sm sm:text-base leading-7" style={{color:'var(--hero-muted)'}}>
              Notes, previous papers, study material and exam tips for SJS students — organised around your class, without the clutter.
            </p>
            <div className="mt-8 max-w-2xl"><HomeClient /></div>
          </div>


        </div>
      </section>

      <main className="archive-shell">
        <section className="py-9 sm:py-11 border-b" style={{borderColor:'var(--border)'}}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <span className="text-[10px] uppercase tracking-[.18em] font-bold" style={{color:'var(--accent)'}}>Your study desk</span>
              <h2 className="font-display text-3xl sm:text-4xl mt-2">Start with what you need.</h2>
            </div>
            <Link href={`/tips?class=${activeClass}`} className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{color:'var(--accent)'}}>Exam tips <ArrowRight className="w-3.5 h-3.5"/></Link>
          </div>
          <div className="grid md:grid-cols-4 border-y mt-8" style={{borderColor:'var(--border)'}}>
            {[
              ['Notes','Chapter-wise revision',BookOpen,`/notes?class=${activeClass}`],
              ['Papers','Past exam practice',FileText,`/previous-papers?class=${activeClass}`],
              ['Tips','A practical exam playbook',Lightbulb,`/tips?class=${activeClass}`],
              ['Contribute','Share useful material',Upload,'/upload'],
            ].map(([title,desc,Icon,href],i) => (
              <Link key={title as string} href={href as string} className={`group min-h-[150px] p-6 flex flex-col justify-between ${i ? 'md:border-l' : ''}`} style={{borderColor:'var(--border)', background:i===3?'var(--accent)':'transparent', color:i===3?'var(--accent-contrast)':'var(--ink)'}}>
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5" />
                  <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <div><div className="font-display text-xl">{title as string}</div><div className="text-[11px] mt-1" style={{color:i===3?'rgba(255,255,255,.72)':'var(--ink-muted)'}}>{desc as string}</div></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-9 sm:py-11 border-b" style={{borderColor:'var(--border)'}}>
          <div className="flex items-end justify-between gap-6">
            <div><span className="text-[10px] uppercase tracking-[.18em] font-bold" style={{color:'var(--accent)'}}>Class {activeClass}</span><h2 className="font-display text-3xl sm:text-4xl mt-2">Browse by subject.</h2><p className="text-sm mt-2 max-w-xl" style={{color:'var(--ink-muted)'}}>A smaller, focused index instead of a wall of categories.</p></div>

          </div>
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px border" style={{background:'var(--border)',borderColor:'var(--border)'}}>
            {subjects.map(subject => <SubjectPicker key={subject} subject={subject} classLevel={activeClass} description={SUBJECT_DETAILS[subject]?.description} />)}
          </div>
        </section>

        <section className="py-9 sm:py-11">
          <div className="border p-6 sm:p-9" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
              <div><span className="text-[10px] uppercase tracking-[.18em] font-bold" style={{color:'var(--accent)'}}>Recently added</span><h2 className="font-display text-3xl mt-2">Fresh into the archive.</h2><p className="text-sm mt-2 max-w-xl" style={{color:'var(--ink-muted)'}}>New material is reviewed before publication. The numbers shown here are real activity, not placeholders.</p></div>
              <Link href={`/search?class=${activeClass}`} className="editorial-cta">Explore all <ArrowRight className="w-3.5 h-3.5"/></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">{recent.items.map(r => <ResourceCard key={r.id} resource={r}/>)}</div>
          </div>
        </section>
      </main>
    </div>
  );
}
