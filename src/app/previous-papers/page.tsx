import React, { Suspense } from 'react';
import PageHead from '@/components/PageHead';
import PaperFinderClient, { PaperFinderView } from './PaperFinderClient';
import { getLibraryBundleSafe } from '@/lib/resources';
import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Previous Year Question Papers: JKBOSE & School Papers',
  description: 'Previous year question papers, JKBOSE board papers, pre-boards and annual exam papers for Classes 9 to 12. Filter by class, subject, year and school.',
  keywords: ['previous year question papers', 'JKBOSE previous papers', 'JKBOSE class 10 question paper', 'JKBOSE class 12 question paper', 'pre-board papers', 'annual exam papers', 'board exam papers PDF'],
  alternates: { canonical: '/previous-papers' },
  openGraph: { title: 'Previous Year Question Papers | ARCHIVUM', description: 'Board and school papers for Classes 9 to 12, filtered by subject and year.', url: '/previous-papers', type: 'website', images: [OG_IMAGE] },
};

// Statically generated (ISR): served from the CDN edge with no function call and no API request.
export const revalidate = 300;

export default async function PreviousPapersPage() {
  const bundle = await getLibraryBundleSafe();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Previous Papers" art="papers" tone="peri">
        JKBOSE board examinations, school pre-boards, unit tests, and terminal test papers across Classes 9 to 12.
      </PageHead>
      {/* The fallback is the full default-class list, so the HTML already contains real content. */}
      <Suspense fallback={<PaperFinderView bundle={bundle} initialClass={10} />}>
        <PaperFinderClient bundle={bundle} />
      </Suspense>
    </div>
  );
}
