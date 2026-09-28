import React from 'react';
import Link from 'next/link';
import { getResources, getRealStats } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import { ArrowRight, BookOpen, FileText, Lightbulb, Upload, Layers3, Archive, PenLine } from 'lucide-react';
import { subjectsForClass, SUBJECT_DETAILS } from '@/lib/subjects';

export const revalidate = 30;

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requestedClass = params.class ? Number(params.class) : undefined;
  const activeClass = [9,10,11,12].includes(requestedClass || 0) ? requestedClass as number : preferred || 10;
  const [featured,recent,stats] = await Promise.all([
    getResources({featured:true,class_level:activeClass,limit:3}),
    getResources({sortBy:'newest',class_level:activeClass,limit:3}),
    getRealStats(),
  ]);

  const study = [
    {n:'01',name:'Notes',desc:'Chapter-wise revision material',icon:BookOpen,href:`/notes?class=${activeClass}`},
    {n:'02',name:'Papers',desc:'Previous exams and practice',icon:FileText,href:`/previous-papers?class=${activeClass}`},
    {n:'03',name:'Tips',desc:'Small things that improve scores',icon:Lightbulb,href:`/tips?class=${activeClass}`},
    {n:'04',name:'Contribute',desc:'Add useful material to the archive',icon:Upload,href:'/upload'},
  ];

  return <div className="home-shell pb-24">
    <section className="archive-hero">
      <div className="hero-inner">
        <div className="animate-rise">
          <div className="hero-eyebrow">SJS STUDENT ARCHIVE · CLASS {activeClass}</div>
          <div className="hero-rule" />
          <h1 className="hero-title">The things you need,<br/><em>kept in one place.</em></h1>
          <p className="hero-copy">Notes, previous papers, study material and practical exam guidance — arranged around your class, without the noise of a thousand tabs.</p>
          <div className="hero-search"><HomeClient /></div>
        </div>
        <div className="hero-index animate-soft-scale">
          <div><div className="hero-index-label">ARCHIVE / {new Date().getFullYear()}</div><div className="hero-number mt-5">{stats.classCounts[activeClass] || 0}</div><div className="text-[11px] mt-2" style={{color:'var(--hero-muted)'}}>catalogued resources for Class {activeClass}</div></div>
          <div className="hero-index-grid mt-10">
            <div className="hero-stat"><strong>{stats.totalDownloads}</strong><span>downloads</span></div>
            <div className="hero-stat"><strong>{stats.totalViews}</strong><span>views</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="section-wrap section-block archive-section">
      <div className="archive-callout">
        <div><div className="text-[9px] uppercase tracking-[.22em] font-bold opacity-70">A sister project, quietly connected</div><h2 className="mt-2">ARCHIVUM × <span className="quest-word">QUEST</span></h2><p>SJS Quest documents the creative side of school life. ARCHIVUM serves the academic side — a separate identity, built for a different job.</p></div>
        <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer">Visit Quest <ArrowRight className="inline w-3 h-3 ml-1"/></a>
      </div>
    </section>

    <section className="section-wrap section-block archive-section">
      <div className="section-heading"><div><div className="section-kicker">Your study desk</div><h2 className="section-title">Everything begins with Class {activeClass}.</h2></div><Link className="text-link" href={`/tips?class=${activeClass}`}>Exam tips <ArrowRight className="w-3 h-3"/></Link></div>
      <div className="study-grid">
        {study.map(({n,name,desc,icon:Icon,href})=><Link href={href} key={name} className="study-tile group"><div className="flex items-center justify-between"><span className="study-index">{n}</span><Icon className="study-icon w-5 h-5" strokeWidth={1.5}/></div><div><div className="study-name">{name}</div><div className="study-desc">{desc}</div></div></Link>)}
      </div>
    </section>

    <section className="section-wrap section-block archive-section">
      <div className="section-heading"><div><div className="section-kicker">Class {activeClass} / catalogue</div><h2 className="section-title">Choose a subject.</h2><p className="section-note">Your class controls this list, keeping the archive focused on what you actually study.</p></div><Link className="text-link hidden sm:inline-flex" href={`/subjects?class=${activeClass}`}>All subjects <ArrowRight className="w-3 h-3"/></Link></div>
      <div className="subject-grid">
        {subjectsForClass(activeClass).map(subject=>{const detail=SUBJECT_DETAILS[subject];return <article className="subject-card" key={subject}>
          <div className="flex items-start justify-between"><div className="subject-mark">{detail?.icon || '•'}</div><Layers3 className="w-4 h-4 opacity-20"/></div>
          <div><h3 className="subject-name">{subject}</h3><p className="text-[10px] mt-1" style={{color:'var(--ink-muted)'}}>{detail?.description}</p><div className="subject-actions"><Link className="subject-action primary" href={`/notes?class=${activeClass}&subject=${encodeURIComponent(subject)}`}><BookOpen className="w-3 h-3"/> Notes</Link><Link className="subject-action" href={`/previous-papers?class=${activeClass}&subject=${encodeURIComponent(subject)}`}><FileText className="w-3 h-3"/> PYQs</Link></div></div>
        </article>})}
      </div>
    </section>

    <section className="section-wrap section-block archive-section">
      <div className="section-heading"><div><div className="section-kicker">Curated shelf</div><h2 className="section-title">Featured for Class {activeClass}.</h2></div><Link className="text-link" href={`/notes?class=${activeClass}`}>Open library <ArrowRight className="w-3 h-3"/></Link></div>
      <div className="feature-grid">{featured.items.map(r=><ResourceCard key={r.id} resource={r}/>)}</div>
    </section>

    <section className="recent-band archive-section">
      <div className="section-wrap">
        <div className="section-heading"><div><div className="section-kicker">Recently added</div><h2 className="section-title">Fresh into the archive.</h2><p className="section-note">New material is reviewed before publication. The numbers shown here are real views, downloads and ratings.</p></div><Link className="text-link" href={`/search?class=${activeClass}`}>Explore all <ArrowRight className="w-3 h-3"/></Link></div>
        <div className="feature-grid">{recent.items.map(r=><ResourceCard key={r.id} resource={r}/>)}</div>
      </div>
    </section>

    <section className="section-wrap section-block archive-section">
      <div className="flex items-center gap-3 border-t pt-7" style={{borderColor:'var(--line)'}}><PenLine className="w-4 h-4" style={{color:'var(--gold)'}}/><p className="text-[10px] uppercase tracking-[.16em]" style={{color:'var(--ink-faint)'}}>ARCHIVUM / built for SJS students / class 9—12</p></div>
    </section>
  </div>;
}
