import React from 'react';
import PageHead from '@/components/PageHead';
import NotesClient from './NotesClient';

export const revalidate = 300;

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; subject?: string }>;
}) {
  const params = await searchParams;
  const parsed = params.class ? parseInt(params.class, 10) : 10;
  const initialClass = [9, 10, 11, 12].includes(parsed) ? parsed : 10;

  return (
    <div className="notes-page-shell max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Notes Library" art="notes" tone="sun">
        Structured chapter notes, theory summaries, and revision guides curated for JKBOSE Classes 9 to 12.
      </PageHead>
      <NotesClient allNotes={[]} initialClass={initialClass} initialSubject={params.subject || ''} />
    </div>
  );
}
