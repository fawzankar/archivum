import React, { Suspense } from 'react';
import PageHead from '@/components/PageHead';
import NotesClient, { NotesView } from './NotesClient';
import { getLibraryBundleSafe } from '@/lib/resources';

// Statically generated (ISR): served from the CDN edge with no function call and no API request.
export const revalidate = 300;

export default async function NotesPage() {
  const bundle = await getLibraryBundleSafe();
  return (
    <div className="notes-page-shell max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Notes Library" art="notes" tone="sun">
        Chapter notes, summaries and revision guides for JKBOSE Classes 9 to 12.
      </PageHead>
      {/* The fallback is the full default-class list, so the HTML already contains real content. */}
      <Suspense fallback={<NotesView bundle={bundle} initialClass={10} initialSubject="" />}>
        <NotesClient bundle={bundle} />
      </Suspense>
    </div>
  );
}
