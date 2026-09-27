import React from 'react';
import Link from 'next/link';
import { CLASS_SUBJECTS, SUBJECT_DETAILS } from '@/lib/subjects';
import { getPreferredClass } from '@/lib/studentClass';

export const revalidate = 0;

export default async function SubjectsPage() {
  const preferred = await getPreferredClass();
  const levels = preferred ? [preferred, ...[9,10,11,12].filter(n => n !== preferred)] : [9,10,11,12];

  return (
    <div className="archive-shell">
      <div className="page-heading">
        <span className="eyebrow">Classes 9–12</span>
        <h1>Subjects in the archive.</h1>
        <p>Pick a class to see the subjects currently organised for it, then open notes or papers without another round of filtering.</p>
      </div>

      <div className="page-section">
        <div className="space-y-10">
          {levels.map(level => (
            <section key={level}>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Class {level}</span>
                  <h2>{CLASS_SUBJECTS[level as keyof typeof CLASS_SUBJECTS].length} subjects</h2>
                </div>
                <Link href={`/notes?class=${level}`} className="btn btn-secondary hidden sm:inline-flex">Open Class {level} notes</Link>
              </div>
              <div>
                {CLASS_SUBJECTS[level as keyof typeof CLASS_SUBJECTS].map(subject => {
                  const detail = SUBJECT_DETAILS[subject];
                  return (
                    <div className="subject-row" key={subject}>
                      <div className="subject-row__bar" />
                      <div>
                        <h3>{subject}</h3>
                        <p>{detail?.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link className="btn btn-soft hidden sm:inline-flex" href={`/notes?class=${level}&subject=${encodeURIComponent(subject)}`}>Notes</Link>
                        <Link className="btn btn-secondary" href={`/previous-papers?class=${level}&subject=${encodeURIComponent(subject)}`}>Papers</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
