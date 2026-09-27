import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import { getResources } from '@/lib/resources';
import SearchClient from './SearchClient';

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    class?: string;
    subject?: string;
    type?: string;
    paperType?: string;
    year?: string;
    school?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q || '';
  const class_level = params.class ? parseInt(params.class, 10) : await getPreferredClass();
  const subject = params.subject || undefined;
  const resource_type = params.type || undefined;
  const paper_type = params.paperType || undefined;
  const year = params.year ? parseInt(params.year, 10) : undefined;
  const school_name = params.school || undefined;
  const sortBy = (params.sort as any) || (q ? 'relevance' : 'newest');
  const page = params.page ? parseInt(params.page, 10) : 1;

  const initialResults = await getResources({
    search: q,
    class_level,
    subject,
    resource_type,
    paper_type,
    year,
    school_name,
    sortBy,
    page,
    limit: 12,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          ACADEMIC INDEX
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Search Library
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
          Search notes, examination papers, formula sheets, chapters, and topics across Classes 9 to 12.
        </p>
      </div>

      <SearchClient
        initialQuery={q}
        initialClass={class_level}
        initialSubject={subject}
        initialType={resource_type}
        initialPaperType={paper_type}
        initialYear={year}
        initialSchool={school_name}
        initialSort={sortBy}
        initialData={initialResults}
      />
    </div>
  );
}
