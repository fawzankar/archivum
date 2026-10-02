import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import PageHead from '@/components/PageHead';
import { getResources } from '@/lib/resources';
import SearchClient from './SearchClient';

export const revalidate = 60;

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
      <PageHead title="Search Library" art="papers" tone="mint">
          Search by chapter, topic or subject, across notes and papers for Classes 9 to 12.
        </PageHead>

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
