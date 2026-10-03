import React, { Suspense } from 'react';
import PageHead from '@/components/PageHead';
import NotesClient, { NotesView } from './NotesClient';
import { getLibraryBundleSafe } from '@/lib/resources';
import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Class 9, 10, 11 & 12 Notes: Chapter-wise Study Notes',
  description: 'Free chapter-wise notes for Classes 9 to 12: Maths, Science, SST, English, Hindi, Urdu, Physics, Chemistry and Biology. Read online and save your favourites.',
  keywords: ['class 9 notes', 'class 10 notes', 'class 11 notes', 'class 12 notes', 'chapter wise notes', 'JKBOSE notes', 'free study notes PDF', 'physics notes', 'chemistry notes', 'biology notes', 'maths notes'],
  alternates: { canonical: '/notes' },
  openGraph: { title: 'Class 9 to 12 Notes | ARCHIVUM', description: 'Chapter-wise notes for every subject, free to read online.', url: '/notes', type: 'website', images: [OG_IMAGE] },
};

// Statically generated (ISR): served from the CDN edge with no function call and no API request.
export const revalidate = 300;

export default async function NotesPage() {
  const bundle = await getLibraryBundleSafe();
  return (
    <div className="notes-page-shell max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Notes Library" art="notes" tone="sun">
        Structured chapter notes, theory summaries, and revision guides curated for JKBOSE Classes 9 to 12.
      </PageHead>
      {/* The fallback is the full default-class list, so the HTML already contains real content. */}
      <Suspense fallback={<NotesView bundle={bundle} initialClass={10} initialSubject="" />}>
        <NotesClient bundle={bundle} />
      </Suspense>
    </div>
  );
}
