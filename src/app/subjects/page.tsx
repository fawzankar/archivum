import React from 'react';
import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';
import SubjectPicker from '@/components/SubjectPicker';
import { CLASS_SUBJECTS, SUBJECT_DETAILS } from '@/lib/subjects';
import { getPreferredClass } from '@/lib/studentClass';

export const revalidate = 0;

export default async function SubjectsPage() {
  const preferred = await getPreferredClass();
  const levels = preferred ? [preferred, ...[9,10,11,12].filter(n => n !== preferred)] : [9,10,11,12];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-9 sm:py-14 space-y-10">
      <section className="rounded-[2.25rem] border overflow-hidden premium-shadow" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="p-7 sm:p-10" style={{ background: 'var(--paper-2)' }}>
          <span className="text-[10px] uppercase tracking-[.22em] font-bold" style={{ color: 'var(--accent)' }}>ARCHIVUM SUBJECTS</span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2 tracking-tight">Find your subject.</h1>
          <p className="max-w-2xl text-sm sm:text-base mt-3 leading-relaxed" style={{ color: 'var(--ink-muted)' }}>Every class has its own clean subject set. Pick one to jump straight into its notes and resources.</p>
        </div>
      </section>

      <div className="space-y-8">
        {levels.map(level => (
          <section key={level} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}><GraduationCap className="w-5 h-5" /></span><div><h2 className="font-display font-bold text-xl">Class {level}</h2><p className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>{CLASS_SUBJECTS[level as keyof typeof CLASS_SUBJECTS].length} subjects</p></div></div>
              <Link href={`/notes?class=${level}`} className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold" style={{ color: 'var(--accent)' }}>All notes <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CLASS_SUBJECTS[level as keyof typeof CLASS_SUBJECTS].map(subject => {
                const detail = SUBJECT_DETAILS[subject];
                return <SubjectPicker key={subject} subject={subject} classLevel={level} description={detail?.description} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
