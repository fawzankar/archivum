import React from 'react';
import Link from 'next/link';
import { getResources, getRealStats } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import { BookOpen, FileText, Lightbulb, Upload, ArrowRight } from 'lucide-react';
import { subjectsForClass, SUBJECT_DETAILS } from '@/lib/subjects';

export const revalidate = 30;

export default async function HomePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const params = await searchParams;
  const preferred = await getPreferredClass();
  const requestedClass = params.class ? Number(params.class) : undefined;
  const activeClass = [9, 10, 11, 12].includes(requestedClass || 0) ? requestedClass as number : preferred || 10;

  const [recent, stats] = await Promise.all([
    getResources({ sortBy: 'newest', class_level: activeClass, limit: 6 }),
    getRealStats(),
  ]);

  const subjects = subjectsForClass(activeClass);

  return (
    <div className="pb-20">
      <section className="home-hero">
        <div className="home-hero__inner">
          <div>
            <span className="eyebrow">Class {activeClass}</span>
            <h1>Study material made easier to find at SJS.</h1>
            <p className="home-hero__copy">
              ARCHIVUM brings together the notes, previous papers and practical
              exam advice students keep looking for during the year. Start with
              your class, then go straight to the subject you need.
            </p>
            <HomeClient />
          </div>

          <aside className="home-stat-panel" aria-label={`Class ${activeClass} archive summary`}>
            <div className="eyebrow">Class {activeClass} archive</div>
            <div className="home-stat-panel__count">{stats.classCounts[activeClass] || 0}</div>
            <div className="home-stat-panel__label">published resources available for this class</div>
            <div className="home-stat-grid">
              <div>
                <strong>{stats.totalViews}</strong>
                <span>views across the archive</span>
              </div>
              <div>
                <strong>{stats.totalDownloads}</strong>
                <span>downloads across the archive</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <main>
        <section className="archive-section page-section">
          <div className="sister-note">
            <div>
              <div className="font-semibold text-sm">SJS QUEST is the creative side of the community.</div>
              <p>Stories, magazines, photography and student work live there.</p>
            </div>
            <a className="btn btn-secondary shrink-0" href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer">
              Visit QUEST <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <section className="archive-section page-section pt-2">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Class {activeClass}</span>
              <h2>Start with what you need today</h2>
              <p>Notes for learning, papers for practice, tips for revision, or a place to share material.</p>
            </div>
          </div>

          <div className="home-tools">
            <Link href={`/notes?class=${activeClass}`} className="home-tool">
              <BookOpen className="w-5 h-5 mb-7" style={{color:'var(--accent)'}} />
              <div className="home-tool__title">Notes</div>
              <div className="home-tool__copy">Chapter notes and revision material.</div>
            </Link>
            <Link href={`/previous-papers?class=${activeClass}`} className="home-tool">
              <FileText className="w-5 h-5 mb-7" style={{color:'var(--accent)'}} />
              <div className="home-tool__title">Previous papers</div>
              <div className="home-tool__copy">Board, school and practice papers.</div>
            </Link>
            <Link href={`/tips?class=${activeClass}`} className="home-tool">
              <Lightbulb className="w-5 h-5 mb-7" style={{color:'var(--accent)'}} />
              <div className="home-tool__title">Tips & Tricks</div>
              <div className="home-tool__copy">Short advice shared by students.</div>
            </Link>
            <Link href="/upload" className="home-tool">
              <Upload className="w-5 h-5 mb-7" style={{color:'var(--accent)'}} />
              <div className="home-tool__title">Upload</div>
              <div className="home-tool__copy">Share useful notes or papers.</div>
            </Link>
          </div>
        </section>

        <section className="archive-section page-section pt-2">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Class {activeClass} subjects</span>
              <h2>Choose a subject</h2>
              <p>The subject list changes with your class profile, so the archive stays relevant.</p>
            </div>
            <Link href={`/subjects?class=${activeClass}`} className="btn btn-secondary hidden sm:inline-flex">All subjects</Link>
          </div>

          <div>
            {subjects.map((subject) => {
              const detail = SUBJECT_DETAILS[subject];
              return (
                <div className="subject-row" key={subject}>
                  <div className="subject-row__bar" />
                  <div>
                    <h3>{subject}</h3>
                    <p>{detail?.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link className="btn btn-soft hidden sm:inline-flex" href={`/notes?class=${activeClass}&subject=${encodeURIComponent(subject)}`}>Notes</Link>
                    <Link className="btn btn-secondary" href={`/previous-papers?class=${activeClass}&subject=${encodeURIComponent(subject)}`}>Papers</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="archive-section page-section pt-2">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Recently added</span>
              <h2>New material for Class {activeClass}</h2>
              <p>Freshly published resources, with the contributor and class information kept alongside each file.</p>
            </div>
            <Link href={`/search?class=${activeClass}`} className="btn btn-secondary hidden sm:inline-flex">Browse the archive</Link>
          </div>

          {recent.items.length ? (
            <div className="resource-grid">
              {recent.items.map(resource => <ResourceCard key={resource.id} resource={resource} />)}
            </div>
          ) : (
            <div className="archive-surface p-8">
              <h3 className="font-display text-xl">There is nothing new here yet.</h3>
              <p className="mt-2 text-sm" style={{color:'var(--ink-muted)'}}>If you have useful Class {activeClass} material, you can upload it for review.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
