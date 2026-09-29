import React from 'react';
import Link from 'next/link';
import { getResources } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import { ArrowUpRight, BookOpen, FileText, FolderOpen, Sparkles } from 'lucide-react';
import SubjectPicker from '@/components/SubjectPicker';
import { subjectsForClass, SUBJECT_DETAILS } from '@/lib/subjects';
import PersonalGreeting from '@/components/PersonalGreeting';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function ArchiveIllustration() {
  return (
    <div className="archive-illustration" aria-hidden="true">
      <div className="archive-illustration-label">FIELD NOTES / 2026</div>
      <div className="archive-paper archive-paper-back"><span /><span /><span /></div>
      <div className="archive-paper archive-paper-main">
        <div className="archive-paper-rule" />
        <div className="archive-paper-title">STUDY<br />ARCHIVE</div>
        <div className="archive-paper-chart"><i /><i /><i /><i /><i /></div>
        <div className="archive-paper-foot"><b>CLASS</b><b>09—12</b></div>
      </div>
      <div className="archive-folder"><div className="archive-folder-tab" /><div className="archive-folder-line" /><div className="archive-folder-line short" /></div>
      <div className="archive-sticker"><Sparkles /></div>
      <div className="archive-ink-dot" />
      <div className="archive-ruler"><span /><span /><span /><span /><span /><span /></div>
    </div>
  );
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requestedClass = params.class ? Number(params.class) : undefined;
  const activeClass = [9, 10, 11, 12].includes(requestedClass || 0) ? requestedClass as number : preferred || 10;
  let recent: { items: Awaited<ReturnType<typeof getResources>>['items'] } = { items: [] };
  try { recent = await getResources({ sortBy: 'newest', class_level: activeClass, limit: 6 }); } catch { recent = { items: [] }; }
  const subjects = subjectsForClass(activeClass);

  return (
    <div className="app-home">
      <section className="home-hero-new">
        <div className="archive-shell home-hero-new-grid">
          <div className="home-hero-new-copy">
            <div className="home-kicker"><span className="home-kicker-mark" /> SJS / ACADEMIC ARCHIVE</div>
            <PersonalGreeting activeClass={activeClass} />
            <h1>Everything you need<br /><em>to study better.</em></h1>
            <p>Notes, previous papers and revision material for Classes 9–12. One quiet place to find the right page, then get back to work.</p>
            <div className="home-search-new"><HomeClient /></div>
            <div className="home-hero-links">
              <Link href={`/notes?class=${activeClass}`}><BookOpen /> Browse notes <ArrowUpRight /></Link>
              <Link href={`/previous-papers?class=${activeClass}`}><FileText /> Previous papers <ArrowUpRight /></Link>
            </div>
          </div>
          <ArchiveIllustration />
        </div>
      </section>

      <section className="archive-shell subject-ledger">
        <div className="section-rail"><span>01</span><div><b>YOUR CLASS</b><small>Class {activeClass} · {subjects.length} subjects</small></div></div>
        <div className="subject-ledger-main">
          <div className="subject-ledger-heading"><h2>Pick a shelf.</h2><p>Open a subject to jump straight to its notes or previous papers.</p></div>
          <div className="subject-ledger-list">
            {subjects.map((subject, index) => (
              <div key={subject} className={`subject-ledger-row row-${index + 1}`}>
                <span className="subject-ledger-index">{String(index + 1).padStart(2, '0')}</span>
                <SubjectPicker subject={subject} classLevel={activeClass} description={SUBJECT_DETAILS[subject]?.description} compact />
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="archive-shell home-main-new">
        <section className="recent-ledger">
          <div className="recent-heading"><div><span>02 / LATEST IN THE ARCHIVE</span><h2>New on the shelves.</h2></div><Link href={`/search?class=${activeClass}`}>Browse all <ArrowUpRight /></Link></div>
          {recent.items.length ? (
            <div className="recent-mosaic">
              {recent.items.map((resource, index) => <div key={resource.id} className={`recent-mosaic-item mosaic-${index + 1}`}><ResourceCard resource={resource} /></div>)}
            </div>
          ) : (
            <div className="home-empty-new"><FolderOpen /><div><strong>The shelf is waiting.</strong><p>New material for Class {activeClass} will appear here as it is added.</p></div></div>
          )}
        </section>
      </main>
    </div>
  );
}
