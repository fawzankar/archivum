import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import { getResources } from '@/lib/resources';
import PaperFinderClient from './PaperFinderClient';

export const revalidate = 0;

export default async function PreviousPapersPage({
  searchParams,
}: {
  searchParams: Promise<{
    class?: string;
    subject?: string;
    paperType?: string;
    year?: string;
    school?: string;
  }>;
}) {
  const params = await searchParams;
  const selectedClass = params.class ? parseInt(params.class, 10) : await getPreferredClass();
  const result = await getResources({ resource_type: 'Previous Year Paper', class_level: selectedClass, limit: 100 });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          ARCHIVE & EXAMINATIONS
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Previous Papers
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
          JKBOSE board examinations, school pre-boards, unit tests, and terminal test papers across Classes 9 to 12.
        </p>
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
