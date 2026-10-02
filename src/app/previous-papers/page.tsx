import React, { Suspense } from 'react';
import PageHead from '@/components/PageHead';
import PaperFinderClient, { PaperFinderView } from './PaperFinderClient';
import { getLibraryBundleSafe } from '@/lib/resources';

// Statically generated (ISR): served from the CDN edge with no function call and no API request.
export const revalidate = 300;

export default async function PreviousPapersPage() {
  const bundle = await getLibraryBundleSafe();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Previous Papers" art="papers" tone="peri">
        JKBOSE board papers, school pre-boards, unit tests and terminal exams for Classes 9 to 12.
      </PageHead>
      {/* The fallback is the full default-class list, so the HTML already contains real content. */}
      <Suspense fallback={<PaperFinderView bundle={bundle} initialClass={10} />}>
        <PaperFinderClient bundle={bundle} />
      </Suspense>
    </div>
  );
}
