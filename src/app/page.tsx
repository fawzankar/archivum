import React from 'react';
import Link from 'next/link';
import { getResources, getRealStats } from '@/lib/resources';
import { getPreferredClass } from '@/lib/studentClass';
import ResourceCard from '@/components/ResourceCard';
import HomeClient from './HomeClient';
import { ArrowRight, BookOpen, FileText, Lightbulb, Upload, Archive } from 'lucide-react';
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

  const subjects = subjectsForClass(activeClass);

  return (
    <div className="pb-24">
      <section className="premium-hero relative overflow-hidden -mt-[68px] pt-[68px] sm:-mt-[76px] sm:pt-[76px]">
        <div className="premium-hero-mark" aria-hidden="true">ARCHIVE / {activeClass}</div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-[minmax(0,1.25fr)_360px] gap-12 lg:gap-16 items-end">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                <span className="w-8 h-px" style={{ background: 'var(--accent)' }} />
                Class {activeClass} archive
              </div>

              <h1 className="premium-hero-title font-display font-bold mt-6">
                Notes, papers and revision material for the year you are actually studying.
              </h1>

              <p className="premium-hero-copy mt-7">
                ARCHIVUM brings together study material shared by SJS students and contributors,
                organised around your class and subjects so you can get to the useful part quickly.
              </p>

              <div className="mt-8 max-w-2xl">
                <HomeClient initialSearch="" />
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs" style={{ color: 'var(--ink-muted)' }}>
                <Link className="premium-text-link" href={`/notes?class=${activeClass}`}>Browse notes <ArrowRight /></Link>
                <Link className="premium-text-link" href={`/previous-papers?class=${activeClass}`}>Open previous papers <ArrowRight /></Link>
                <Link className="premium-text-link" href={`/tips?class=${activeClass}`}>Read exam tips <ArrowRight /></Link>
              </div>
            </div>

            <aside className="premium-hero-aside">
              <div className="premium-aside-head">
                <div>
                  <span className="premium-overline">Class {activeClass}</span>
                  <p className="premium-aside-title">What is in the archive</p>
                </div>
                <span className="premium-aside-icon"><Archive /></span>
              </div>

              <div className="premium-stat-main">
                <strong>{stats.classCounts[activeClass] || 0}</strong>
                <span>resources currently filed for Class {activeClass}</span>
              </div>

              <div className="premium-stat-grid">
                <div><strong>{stats.totalViews}</strong><span>views</span></div>
                <div><strong>{stats.totalDownloads}</strong><span>downloads</span></div>
              </div>

              <Link href={`/subjects?class=${activeClass}`} className="premium-aside-link">
                Browse the Class {activeClass} subjects
                <ArrowRight />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <section className="premium-section premium-intro">
          <div className="premium-intro-copy">
            <span className="premium-overline">SJS community</span>
            <h2 className="font-display">Built from the material students actually pass around.</h2>
            <p>
              Upload a useful note, a previous paper, a chapter summary or an exam tip.
              After review, it becomes part of the archive for the next student who needs it.
            </p>
          </div>
          <Link href="/upload" className="premium-primary-button">
            <Upload /> Share study material
          </Link>
        </section>

        <section className="premium-section">
          <div className="premium-section-heading">
            <div>
              <span className="premium-overline">Class {activeClass}</span>
              <h2 className="font-display">Choose where you want to study.</h2>
            </div>
            <Link href={`/subjects?class=${activeClass}`} className="premium-text-link">
              All subjects <ArrowRight />
            </Link>
          </div>

          <div className="premium-study-grid">
            <Link href={`/notes?class=${activeClass}`} className="premium-study-item premium-study-featured">
              <span className="premium-study-icon"><BookOpen /></span>
              <div>
                <h3>Notes</h3>
                <p>Chapter-wise material for revision and last-minute recall.</p>
              </div>
              <ArrowRight className="premium-study-arrow" />
            </Link>
            <Link href={`/previous-papers?class=${activeClass}`} className="premium-study-item">
              <span className="premium-study-icon"><FileText /></span>
              <div>
                <h3>Previous papers</h3>
                <p>Work through older papers and get used to the question format.</p>
              </div>
              <ArrowRight className="premium-study-arrow" />
            </Link>
            <Link href={`/tips?class=${activeClass}`} className="premium-study-item">
              <span className="premium-study-icon"><Lightbulb /></span>
              <div>
                <h3>Tips &amp; Tricks</h3>
                <p>Short, practical advice shared around exams and revision.</p>
              </div>
              <ArrowRight className="premium-study-arrow" />
            </Link>
          </div>
        </section>

        <section className="premium-section">
          <div className="premium-section-heading">
            <div>
              <span className="premium-overline">Subjects</span>
              <h2 className="font-display">Class {activeClass} subjects</h2>
              <p>Pick a subject to see its notes and previous papers.</p>
            </div>
          </div>

          <div className="premium-subject-list">
            {subjects.map((subject) => {
              const detail = SUBJECT_DETAILS[subject];
              return (
                <div className="premium-subject-row" key={subject}>
                  <div className="premium-subject-name">
                    <div>
                      <h3>{subject}</h3>
                      <p>{detail?.description}</p>
                    </div>
                  </div>
                  <div className="premium-subject-actions">
                    <Link href={`/notes?class=${activeClass}&subject=${encodeURIComponent(subject)}`}>Notes <ArrowRight /></Link>
                    <Link href={`/previous-papers?class=${activeClass}&subject=${encodeURIComponent(subject)}`}>Papers <ArrowRight /></Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="premium-section">
          <div className="premium-section-heading">
            <div>
              <span className="premium-overline">Archive picks</span>
              <h2 className="font-display">A few useful files to start with.</h2>
            </div>
            <Link href={`/search?class=${activeClass}`} className="premium-text-link">Search the archive <ArrowRight /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.items.map(resource => <ResourceCard key={resource.id} resource={resource} />)}
          </div>
        </section>

        <section className="premium-section premium-recent">
          <div className="premium-section-heading">
            <div>
              <span className="premium-overline">Recently added</span>
              <h2 className="font-display">New material for Class {activeClass}</h2>
            </div>
            <Link href={`/search?class=${activeClass}`} className="premium-text-link">See everything <ArrowRight /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recent.items.map(resource => <ResourceCard key={resource.id} resource={resource} />)}
          </div>
        </section>

        <section className="premium-quest">
          <div>
            <span className="premium-overline">From the same SJS community</span>
            <h2 className="font-display">Looking for the creative side of school?</h2>
            <p>
              SJS <span className="quest-word">QUEST</span> is where school stories, magazines,
              photography and creative work live.
            </p>
          </div>
          <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="premium-secondary-button">
            Visit <span className="quest-word">QUEST</span> <ArrowRight />
          </a>
        </section>
      </div>
    </div>
  );
}
