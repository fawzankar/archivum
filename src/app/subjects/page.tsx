import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Layers3 } from 'lucide-react';
import SubjectPicker from '@/components/SubjectPicker';
import { CLASS_SUBJECTS, SUBJECT_DETAILS } from '@/lib/subjects';
import { getPreferredClass } from '@/lib/studentClass';

export const revalidate = 0;

export default async function SubjectsPage() {
  const preferred = await getPreferredClass();
  const levels = preferred ? [preferred, ...[9,10,11,12].filter(n => n !== preferred)] : [9,10,11,12];
  return (
    <div className="archive-page-editorial archive-shell">
      <header className="editorial-page-head">
        <div className="editorial-page-mark"><Layers3 /></div>
        <div><span>THE SUBJECT INDEX</span><h1>Find the right shelf.</h1><p>Each class has its own set of subjects. Open one to choose notes or previous papers without losing your place.</p></div>
      </header>
      <div className="subject-index-list">
        {levels.map(level => (
          <section key={level} className="subject-index-class">
            <div className="subject-index-class-head"><div><span>CLASS {level}</span><h2>{CLASS_SUBJECTS[level as keyof typeof CLASS_SUBJECTS].length} subjects</h2></div><Link href={`/notes?class=${level}`}>All notes <ArrowUpRight /></Link></div>
            <div className="subject-index-rows">
              {CLASS_SUBJECTS[level as keyof typeof CLASS_SUBJECTS].map((subject, index) => (
                <div className="subject-index-row" key={subject}><span>{String(index + 1).padStart(2,'0')}</span><SubjectPicker subject={subject} classLevel={level} description={SUBJECT_DETAILS[subject]?.description} compact /></div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
