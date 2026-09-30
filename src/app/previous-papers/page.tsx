import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import PageHead from '@/components/PageHead';
import { getResources } from '@/lib/resources';
import PaperFinderClient from './PaperFinderClient';

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
  const [preferredClass, result] = await Promise.all([
    params.class ? Promise.resolve(null) : getPreferredClass(),
    getResources({ resource_type: 'Previous Year Paper', limit: 200, withCount: false }),
  ]);
  const selectedClass = params.class ? parseInt(params.class, 10) : preferredClass;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Previous Papers" art="papers" tone="peri">
          JKBOSE board examinations, school pre-boards, unit tests, and terminal test papers across Classes 9 to 12.
        </PageHead>

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
