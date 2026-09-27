import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, GraduationCap } from 'lucide-react';
import { CLASS_SUBJECTS, SUBJECT_DETAILS } from '@/lib/subjects';
import { getPreferredClass } from '@/lib/studentClass';

export const revalidate = 0;

export default async function SubjectsPage() {
  const preferred = await getPreferredClass();
  const levels = preferred ? [preferred, ...[9, 10, 11, 12].filter(n => n !== preferred)] : [9, 10, 11, 12];
  return <div className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-8 py-12 sm:py-16 pb-24">
    <section className="border-y py-10 sm:py-14" style={{ borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Subjects</p>
      <h1 className="font-display font-bold text-4xl sm:text-5xl mt-3">Choose a class, then a subject.</h1>
      <p className="max-w-2xl text-sm sm:text-base mt-4 leading-7" style={{ color: 'var(--ink-muted)' }}>Each subject links directly to its notes. From there, you can move into previous papers and other material without changing your class profile.</p>
    </section>
    <div className="pt-12 space-y-14">
      {levels.map(level => <section key={level}>
        <div className="flex items-end justify-between gap-5 mb-5"><div className="flex items-center gap-3"><span className="w-9 h-9 flex items-center justify-center border" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-light)' }}><GraduationCap className="w-4 h-4" /></span><div><h2 className="font-display font-bold text-2xl">Class {level}</h2><p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>{CLASS_SUBJECTS[level as keyof typeof CLASS_SUBJECTS].length} subjects</p></div></div><Link href={`/notes?class=${level}`} className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--accent)' }}>All notes <ArrowUpRight className="w-3.5 h-3.5" /></Link></div>
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          {CLASS_SUBJECTS[level as keyof typeof CLASS_SUBJECTS].map(subject => { const detail = SUBJECT_DETAILS[subject]; return <Link key={subject} href={`/notes?class=${level}&subject=${encodeURIComponent(subject)}`} className="subject-index-item grid grid-cols-[1fr_auto] items-center gap-4"><div><h3 className="font-display font-bold text-xl">{subject}</h3><p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>{detail?.description}</p></div><ArrowUpRight className="w-4 h-4" style={{ color: 'var(--ink-faint)' }} /></Link>; })}
        </div>
      </section>)}
    </div>
  </div>;
}
