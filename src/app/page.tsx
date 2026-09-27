import React from 'react';
import Link from 'next/link';
import { getResources, getRealStats } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import { ArrowUpRight, BookOpen, FileText, Lightbulb, Upload } from 'lucide-react';
import { subjectsForClass, SUBJECT_DETAILS } from '@/lib/subjects';

export const revalidate = 30;

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requestedClass = params.class ? Number(params.class) : undefined;
  const activeClass = [9, 10, 11, 12].includes(requestedClass || 0) ? requestedClass as number : preferred || 10;

  const [featured, recent, stats] = await Promise.all([
    getResources({ featured: true, class_level: activeClass, limit: 3 }),
    getResources({ sortBy: 'newest', class_level: activeClass, limit: 3 }),
    getRealStats(),
  ]);

  return (
    <div className="pb-24">
      <section className="hero-editorial relative overflow-hidden -mt-[68px] pt-[68px] sm:-mt-[76px] sm:pt-[76px]">
        <div className="relative max-w-7xl mx-auto px-5 sm:px-7 lg:px-8 py-16 sm:py-24 lg:py-28 grid lg:grid-cols-[1.15fr_.85fr] gap-12 lg:gap-20 items-end">
          <div className="max-w-3xl">
            <div className="hero-kicker">Class {activeClass}</div>
            <div className="hero-accent-rule mt-4" aria-hidden="true" />
            <h1 className="font-display font-bold mt-6" style={{ color: 'var(--hero-ink)' }}>
              Study from the material your class actually uses.
            </h1>
            <p className="text-sm sm:text-base max-w-2xl mt-7 leading-7" style={{ color: 'var(--hero-muted)' }}>
              ARCHIVUM brings together class notes, previous papers and useful exam guidance for SJS students. Pick a subject or search for the exact chapter you need.
            </p>
            <div className="mt-8 max-w-2xl"><HomeClient initialSearch="" /></div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs" style={{ color: 'var(--hero-muted)' }}>
              <span>Class {activeClass} archive</span>
              <span>{stats.classCounts[activeClass] || 0} resources</span>
              <Link href={`/subjects?class=${activeClass}`} className="font-semibold" style={{ color: 'var(--accent)' }}>Browse subjects</Link>
            </div>
          </div>

          <aside className="premium-stat-panel relative border bg-[var(--surface)] p-6 sm:p-7" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Class {activeClass} archive</p>
                <p className="mt-2 text-sm leading-6 max-w-xs" style={{ color: 'var(--ink-muted)' }}>A quick look at what has been collected and used across ARCHIVUM.</p>
              </div>
              <span className="w-10 h-10 flex items-center justify-center border" style={{ borderColor: 'var(--border)', color: 'var(--accent)', background: 'var(--accent-light)' }}><BookOpen className="w-5 h-5" /></span>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-0 border-y" style={{ borderColor: 'var(--border)' }}>
              <div className="py-5 pr-3 border-r" style={{ borderColor: 'var(--border)' }}><div className="font-display text-3xl font-bold">{stats.classCounts[activeClass] || 0}</div><div className="text-[11px] mt-1" style={{ color: 'var(--ink-muted)' }}>resources</div></div>
              <div className="py-5 px-3 border-r" style={{ borderColor: 'var(--border)' }}><div className="font-display text-3xl font-bold">{stats.totalDownloads}</div><div className="text-[11px] mt-1" style={{ color: 'var(--ink-muted)' }}>downloads</div></div>
              <div className="py-5 pl-3"><div className="font-display text-3xl font-bold">{stats.totalViews}</div><div className="text-[11px] mt-1" style={{ color: 'var(--ink-muted)' }}>views</div></div>
            </div>
            <p className="mt-5 text-[11px] leading-5" style={{ color: 'var(--ink-faint)' }}>Use the class selector in the header whenever you want to change your study profile.</p>
          </aside>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-8 pt-16 sm:pt-20">
        <div className="grid lg:grid-cols-[1.05fr_.95fr] border-y" style={{ borderColor: 'var(--border)' }}>
          <div className="py-8 sm:py-10 lg:pr-12 lg:border-r" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>SJS QUEST</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-3">The school archive has a creative side too.</h2>
            <p className="mt-4 text-sm leading-7 max-w-xl" style={{ color: 'var(--ink-muted)' }}>QUEST collects school stories, magazines, photography and creative work from the SJS community.</p>
          </div>
          <div className="py-8 sm:py-10 lg:pl-12 flex items-end">
            <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="premium-button premium-button-secondary inline-flex items-center gap-2">Visit QUEST <ArrowUpRight className="w-4 h-4" /></a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-8 pt-20 sm:pt-28">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div><p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>For Class {activeClass}</p><h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">Start with what you need today.</h2></div>
          <Link href={`/tips?class=${activeClass}`} className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--accent)' }}>Exam tips <ArrowUpRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid md:grid-cols-3 border-y" style={{ borderColor: 'var(--border)' }}>
          <Link href={`/notes?class=${activeClass}`} className="group py-7 pr-6 md:border-r" style={{ borderColor: 'var(--border)' }}><BookOpen className="w-5 h-5" style={{ color: 'var(--accent)' }} /><h3 className="font-display font-bold text-2xl mt-8">Notes</h3><p className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-muted)' }}>Chapter-wise material for revision and understanding.</p><span className="inline-flex mt-5 text-xs font-semibold" style={{ color: 'var(--accent)' }}>Open notes <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></span></Link>
          <Link href={`/previous-papers?class=${activeClass}`} className="group py-7 px-0 md:px-7 md:border-r" style={{ borderColor: 'var(--border)' }}><FileText className="w-5 h-5" style={{ color: 'var(--accent)' }} /><h3 className="font-display font-bold text-2xl mt-8">Previous papers</h3><p className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-muted)' }}>Past exam papers and practice material arranged by class and subject.</p><span className="inline-flex mt-5 text-xs font-semibold" style={{ color: 'var(--accent)' }}>Find a paper <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></span></Link>
          <Link href={`/tips?class=${activeClass}`} className="group py-7 pl-0 md:pl-7"><Lightbulb className="w-5 h-5" style={{ color: 'var(--accent)' }} /><h3 className="font-display font-bold text-2xl mt-8">Tips & Tricks</h3><p className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-muted)' }}>Short advice from students and contributors who have already worked through the material.</p><span className="inline-flex mt-5 text-xs font-semibold" style={{ color: 'var(--accent)' }}>Read tips <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></span></Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-8 pt-20 sm:pt-28">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div><p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Class {activeClass} subjects</p><h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">Choose a subject.</h2></div>
          <Link href={`/subjects?class=${activeClass}`} className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--accent)' }}>All subjects <ArrowUpRight className="w-4 h-4" /></Link>
        </div>
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          {subjectsForClass(activeClass).map((subject) => {
            const detail = SUBJECT_DETAILS[subject];
            return <div key={subject} className="subject-index-item grid grid-cols-[44px_1fr_auto] sm:grid-cols-[64px_1fr_auto] items-center gap-4">
              <span className="font-display text-xl" style={{ color: 'var(--accent)' }}>{String(index + 1).padStart(2, '0')}</span>
              <div><h3 className="font-display font-bold text-xl sm:text-2xl">{subject}</h3><p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>{detail?.description}</p></div>
              <div className="flex items-center gap-2"><Link href={`/notes?class=${activeClass}&subject=${encodeURIComponent(subject)}`} className="hidden sm:inline-flex premium-button premium-button-secondary text-xs">Notes</Link><Link href={`/previous-papers?class=${activeClass}&subject=${encodeURIComponent(subject)}`} className="premium-button premium-button-primary text-xs inline-flex items-center">Papers</Link></div>
            </div>;
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-8 pt-20 sm:pt-28">
        <div className="flex items-end justify-between gap-6 mb-8"><div><p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Selected resources</p><h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">Useful material for Class {activeClass}.</h2></div><Link href={`/notes?class=${activeClass}`} className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--accent)' }}>Open library <ArrowUpRight className="w-4 h-4" /></Link></div>
        {featured.items.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{featured.items.map(r => <ResourceCard key={r.id} resource={r} />)}</div> : <div className="prose-surface p-8 text-sm" style={{ color: 'var(--ink-muted)' }}>There are no featured resources for this class yet.</div>}
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-8 pt-20 sm:pt-28">
        <div className="flex items-end justify-between gap-6 mb-8"><div><p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Recently added</p><h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">New material in the archive.</h2></div><Link href={`/search?class=${activeClass}`} className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--accent)' }}>Search the archive <ArrowUpRight className="w-4 h-4" /></Link></div>
        {recent.items.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{recent.items.map(r => <ResourceCard key={r.id} resource={r} />)}</div> : <div className="prose-surface p-8 text-sm" style={{ color: 'var(--ink-muted)' }}>New material will appear here as contributors add it.</div>}
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-8 pt-20 sm:pt-28">
        <div className="border-y py-10 sm:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-7" style={{ borderColor: 'var(--border)' }}>
          <div><p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Have something useful?</p><h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">Add it to the archive.</h2><p className="mt-3 text-sm leading-6 max-w-xl" style={{ color: 'var(--ink-muted)' }}>Share a paper, notes or another useful resource with the SJS community. Uploads are reviewed before they appear publicly.</p></div>
          <Link href="/upload" className="premium-button premium-button-primary inline-flex items-center gap-2 shrink-0"><Upload className="w-4 h-4" /> Upload material</Link>
        </div>
      </section>
    </div>
  );
}
