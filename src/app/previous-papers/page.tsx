import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import { getResources } from '@/lib/resources';
import PaperFinderClient from './PaperFinderClient';

export const revalidate = 0;

export default async function PreviousPapersPage({ searchParams }: { searchParams: Promise<{ class?: string; subject?: string; paperType?: string; year?: string; school?: string }> }) {
  const params = await searchParams;
  const selectedClass = params.class ? parseInt(params.class, 10) : await getPreferredClass();
  const result = await getResources({ resource_type: 'Previous Year Paper', class_level: selectedClass, limit: 100 });

  return (
    <div className="archive-shell">
      <div className="page-heading">
        <span className="eyebrow">Class {selectedClass || '9–12'} papers</span>
        <h1>Past papers for practice.</h1>
        <p>Find board papers, school examinations, pre-boards and other papers by class, subject, year and paper type.</p>
      </div>
      <PaperFinderClient
        allPapers={result.items}
        initialClass={selectedClass}
        initialSubject={params.subject}
        initialPaperType={params.paperType}
        initialYear={params.year ? parseInt(params.year, 10) : undefined}
        initialSchool={params.school}
      />
    </div>
  );
}
