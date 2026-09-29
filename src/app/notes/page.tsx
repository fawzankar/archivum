import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import PageHead from '@/components/PageHead';
import { getResources } from '@/lib/resources';
import NotesClient from './NotesClient';

export const revalidate = 30;

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; subject?: string }>;
}) {
  const params = await searchParams;
  const initialClass = params.class ? parseInt(params.class, 10) : (await getPreferredClass()) || 10;
  const initialSubject = params.subject || '';
  const initialNotes = (await getResources({ class_level: initialClass, resource_type: 'Notes', limit: 40 })).items;

  return (
    <div className="notes-page-shell max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Notes Library" art="notes" tone="sun">
          Structured chapter notes, theory summaries, and revision guides curated for JKBOSE Classes 9 to 12.
        </PageHead>

      <NotesClient
        allNotes={initialNotes}
        initialClass={initialClass}
        initialSubject={initialSubject}
      />
    </div>
  );
}
