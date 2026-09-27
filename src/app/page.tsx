import React from 'react';
import Link from 'next/link';
import { getResources, getRealStats } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import { FileText, BookOpen, Lightbulb, Upload, ArrowUpRight } from 'lucide-react';
import { subjectsForClass, SUBJECT_DETAILS } from '@/lib/subjects';

export const revalidate = 30;

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requestedClass = params.class ? Number(params.class) : undefined;
  const activeClass = [9,10,11,12].includes(requestedClass || 0) ? requestedClass as number : preferred || 10;
  const [featured, recent, stats] = await Promise.all([
    getResources({ featured:true, class_level:activeClass, limit:3 }),
    getResources({ sortBy:'newest', class_level:activeClass, limit:3 }),
    getRealStats(),
  ]);

  return <div className="pb-24">
    <section className="home-hero">
      <div className="home-hero-grid">
        <div>
          <p className="text-sm font-medium" style={{color:'var(--accent)'}}>ARCHIVUM for SJS students</p>
          <div className="hero-rule" aria-hidden="true" />
          <h1 className="font-display">The school material you need, organised around your class.</h1>
          <p className="home-hero-copy">For Classes 9–12, ARCHIVUM brings together class notes, previous papers and practical exam tips. The archive is arranged around the subjects students use in the JKBOSE course, so you can get to the right material without digging through old chats and folders.</p>
          <div className="mt-8 max-w-2xl"><HomeClient initialSearch="" /></div>
        </div>
        <aside className="hero-side">
          <p className="text-sm font-medium" style={{color:'var(--ink-muted)'}}>Class {activeClass}</p>
          <div className="hero-side-number mt-3">{stats.classCounts[activeClass] || 0}</div>
          <p className="mt-2 text-sm" style={{color:'var(--ink-muted)'}}>approved resources currently listed for this class</p>
          <div className="mt-7 pt-5 border-t" style={{borderColor:'var(--border)'}}>
            <p className="text-sm font-medium">JKBOSE-focused study material</p>
            <p className="text-xs mt-1" style={{color:'var(--ink-muted)'}}>Board papers, school exams, chapter notes and revision material.</p>
          </div>
        </aside>
      </div>
    </section>

    <div className="section-wrap">
      <section className="section-block">
        <div className="section-heading">
          <div><h2 className="font-display">Start with your class</h2><p>Pick a section depending on what you are doing today: revising a chapter, practising a paper, or looking for a quick exam tip.</p></div>
        </div>
        <div className="archive-split">
          <Link href={`/notes?class=${activeClass}`} className="group block">
            <div className="flex items-center justify-between"><BookOpen className="w-5 h-5" style={{color:'var(--accent)'}}/><span className="text-sm font-medium" style={{color:'var(--accent)'}}>Notes</span></div>
            <h3 className="font-display text-2xl mt-8">Revise a chapter</h3>
            <p className="mt-2 text-sm" style={{color:'var(--ink-muted)'}}>Find class-wise notes and revision material by subject and chapter.</p>
          </Link>
          <Link href={`/previous-papers?class=${activeClass}`} className="group block">
            <div className="flex items-center justify-between"><FileText className="w-5 h-5" style={{color:'var(--accent)'}}/><span className="text-sm font-medium" style={{color:'var(--accent)'}}>Previous papers</span></div>
            <h3 className="font-display text-2xl mt-8">Practise the paper</h3>
            <p className="mt-2 text-sm" style={{color:'var(--ink-muted)'}}>Board, pre-board, unit test, half-yearly, annual and sample papers are grouped by class and subject.</p>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-0 border-b" style={{borderColor:'var(--border)'}}>
          <Link href={`/tips?class=${activeClass}`} className="p-7 border-r sm:border-r" style={{borderColor:'var(--border)'}}><Lightbulb className="w-5 h-5" style={{color:'var(--accent)'}}/><h3 className="font-display text-xl mt-5">Need a study tip?</h3><p className="text-sm mt-2" style={{color:'var(--ink-muted)'}}>Short suggestions from students and contributors, organised by class and subject.</p></Link>
          <Link href="/upload" className="p-7"><Upload className="w-5 h-5" style={{color:'var(--accent)'}}/><h3 className="font-display text-xl mt-5">Have something useful?</h3><p className="text-sm mt-2" style={{color:'var(--ink-muted)'}}>Share a clear note or paper so another student can find it later.</p></Link>
        </div>
      </section>

      <section className="section-block pt-0">
        <div className="section-heading">
          <div><h2 className="font-display">Class {activeClass} subjects</h2><p>For Classes 9–10, the archive covers Mathematics, Science, Social Science, English, Hindi and Urdu. Classes 11–12 focus here on Mathematics, Biology, Physics, Chemistry and English.</p></div>
          <Link href={`/subjects?class=${activeClass}`} className="text-sm font-medium" style={{color:'var(--accent)'}}>See all subjects</Link>
        </div>
        <div className="subject-list">
          {subjectsForClass(activeClass).map(subject => {
            const detail = SUBJECT_DETAILS[subject];
            return <div key={subject} className="subject-row">
              <Link href={`/notes?class=${activeClass}&subject=${encodeURIComponent(subject)}`}>
                <h3>{subject}</h3>
                <p>{detail?.description}</p>
              </Link>
              <div className="mt-5 flex gap-4 text-xs font-medium">
                <Link href={`/notes?class=${activeClass}&subject=${encodeURIComponent(subject)}`} style={{color:'var(--accent)'}}>Notes</Link>
                <Link href={`/previous-papers?class=${activeClass}&subject=${encodeURIComponent(subject)}`} style={{color:'var(--ink-muted)'}}>Papers</Link>
              </div>
            </div>;
          })}
        </div>
      </section>

      <section className="section-block pt-0">
        <div className="section-heading"><div><h2 className="font-display">Selected material</h2><p>Resources marked as useful by the archive team, followed by material added most recently.</p></div><Link href={`/notes?class=${activeClass}`} className="text-sm font-medium" style={{color:'var(--accent)'}}>Browse the library</Link></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{featured.items.map(r => <ResourceCard key={r.id} resource={r} />)}</div>
      </section>

      <section className="section-block pt-0">
        <div className="section-heading"><div><h2 className="font-display">New in the archive</h2><p>Recently approved material for Class {activeClass}.</p></div><Link href={`/search?class=${activeClass}`} className="text-sm font-medium" style={{color:'var(--accent)'}}>Search everything</Link></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{recent.items.map(r => <ResourceCard key={r.id} resource={r} />)}</div>
      </section>

      <section className="section-block pt-0">
        <div className="home-cta">
          <div><h2 className="font-display text-3xl">If you have a paper or note worth keeping, add it.</h2><p className="mt-2 max-w-2xl text-sm opacity-85">Upload it with the class, subject and contributor name. The archive team reviews submissions before they appear in the library.</p></div>
          <Link href="/upload" className="shrink-0 inline-flex items-center gap-2 px-5 py-3 text-sm font-medium bg-white" style={{color:'var(--accent)'}}>Upload material <ArrowUpRight className="w-4 h-4"/></Link>
        </div>
      </section>
    </div>
  </div>;
}
