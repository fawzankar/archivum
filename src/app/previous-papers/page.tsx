import React from 'react';
import PageHead from '@/components/PageHead';
import PaperFinderClient from './PaperFinderClient';
import { getLibraryItems } from '@/lib/resources';

export const revalidate = 300;

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
  const parsed = params.class ? parseInt(params.class, 10) : 10;
  const selectedClass = [9, 10, 11, 12].includes(parsed) ? parsed : undefined;

  // Fetched on the server (cached) so the list is in the first HTML — no client waterfall.
  const initialPapers = await getLibraryItems('Previous Year Paper', selectedClass);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Previous Papers" art="papers" tone="peri">
        JKBOSE board examinations, school pre-boards, unit tests, and terminal test papers across Classes 9 to 12.
      </PageHead>
      <PaperFinderClient
        allPapers={initialPapers}
        initialClass={selectedClass}
        initialSubject={params.subject}
        initialPaperType={params.paperType}
        initialYear={params.year ? parseInt(params.year, 10) : undefined}
        initialSchool={params.school}
        explicitClass={Boolean(params.class)}
      />
    </div>
  );
}
