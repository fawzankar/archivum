import React from 'react';
import Link from 'next/link';
import { getResources } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import ArchiveIllustration from '@/components/ArchiveIllustration';
import PersonalGreeting from '@/components/PersonalGreeting';
import { ArrowUpRight, BookOpen, Bookmark, FileText, Search } from 'lucide-react';
import { subjectsForClass, SUBJECT_DETAILS } from '@/lib/subjects';
import SubjectPicker from '@/components/SubjectPicker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requested = Number(params.class);
  const activeClass = [9, 10, 11, 12].includes(requested) ? requested : preferred || 10;

  let recent: Awaited<ReturnType<typeof getResources>>['items'] = [];
  try {
    recent = (await getResources({ sortBy: 'newest', class_level: activeClass, limit: 6 })).items;
  } catch {}

  const subjects = subjectsForClass(activeClass);

  return (
    <div className="illustrated-app-home">
      <section className="illustrated-hero">
        <div className="archive-shell illustrated-hero-grid">
          <div className="illustrated-hero-copy">
            <div className="eyebrow-sticker"><span className="sticker-dot" /> YOUR STUDY ARCHIVE</div>
            <PersonalGreeting activeClass={activeClass} />
            <h1 className="illustrated-headline">Everything you need,<br /><em>kept together.</em></h1>
            <p className="illustrated-lede">Notes, previous papers, formulas and revision material for Class {activeClass}. Open a subject, pick a resource, and keep moving.</p>
            <div className="illustrated-search"><HomeClient /></div>
            <div className="hero-actions">
              <Link href={`/notes?class=${activeClass}`} className="ink-button"><BookOpen /> Browse notes <ArrowUpRight /></Link>
              <Link href={`/previous-papers?class=${activeClass}`} className="paper-button"><FileText /> Previous papers</Link>
            </div>
            <div className="hero-note"><span className="note-mark">✦</span><span><strong>Made for studying, not scrolling.</strong> The archive keeps the useful stuff close.</span></div>
          </div>
          <div className="illustrated-hero-art"><ArchiveIllustration /></div>
        </div>
      </section>

      <section className="class-ribbon">
        <div className="archive-shell class-ribbon-inner">
          <div className="class-ribbon-label"><span>YOUR SHELF</span><strong>Class {activeClass}</strong></div>
          <div className="class-ribbon-links">
            {[9, 10, 11, 12].map(level => <Link key={level} href={`/?class=${level}`} className={level === activeClass ? 'selected' : ''}>Class {level}</Link>)}
          </div>
          <Link href={`/saved?class=${activeClass}`} className="saved-link"><Bookmark /> Saved <ArrowUpRight /></Link>
        </div>
      </section>

      <main className="archive-shell illustrated-main">
        <section className="illustrated-subjects">
          <div className="section-heading-illustrated">
            <div><span className="section-number">01</span><div><p className="section-kicker">OPEN A SUBJECT</p><h2>Your subjects</h2></div></div>
            <p>{subjects.length} shelves for Class {activeClass}</p>
          </div>
          <div className="subject-board">
            <div className="subject-board-side"><div className="side-note">Pick a subject.<br />The archive does the rest.</div><div className="side-lines" /></div>
            <div className="subject-board-grid">
              {subjects.map((subject, index) => (
                <div className={`subject-board-item subject-board-item-${index % 4}`} key={subject}>
                  <span className="subject-index">{String(index + 1).padStart(2, '0')}</span>
                  <SubjectPicker subject={subject} classLevel={activeClass} description={SUBJECT_DETAILS[subject]?.description} compact />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="illustrated-jump">
          <div className="jump-copy"><span className="section-kicker">KEEP IT CLOSE</span><h2>Pick up where you need to be.</h2><p>Three useful corners of the archive, without the clutter.</p></div>
          <div className="jump-shelf">
            <Link href={`/notes?class=${activeClass}`} className="jump-piece piece-blue"><span className="piece-label">01</span><BookOpen /><strong>Study notes</strong><small>Chapter-wise material</small><ArrowUpRight /></Link>
            <Link href={`/previous-papers?class=${activeClass}`} className="jump-piece piece-yellow"><span className="piece-label">02</span><FileText /><strong>Previous papers</strong><small>Past papers & practice sets</small><ArrowUpRight /></Link>
            <Link href={`/saved?class=${activeClass}`} className="jump-piece piece-green"><span className="piece-label">03</span><Bookmark /><strong>Your saved shelf</strong><small>Resources you want nearby</small><ArrowUpRight /></Link>
          </div>
        </section>

        <section className="illustrated-recent">
          <div className="section-heading-illustrated recent-heading">
            <div><span className="section-number">02</span><div><p className="section-kicker">FRESH ON THE SHELF</p><h2>Recently added</h2></div></div>
            <Link href={`/search?class=${activeClass}`}>See everything <ArrowUpRight /></Link>
          </div>
          {recent.length ? <div className="illustrated-resource-grid">{recent.map((resource, index) => <div key={resource.id} className={`resource-piece resource-piece-${index % 3}`}><ResourceCard resource={resource} /></div>)}</div> : <div className="illustrated-empty"><Search /><strong>Nothing new on this shelf yet.</strong><span>Try another class or browse the full archive.</span></div>}
        </section>
      </main>
    </div>
  );
}
