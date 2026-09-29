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

  const result = await getResources({ resource_type: 'Notes', class_level: initialClass, limit: 40 });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Notes Library" art="notes" tone="sun">
          Structured chapter notes, theory summaries, and revision guides curated for JKBOSE Classes 9 to 12.
        </PageHead>

      <NotesClient
        allNotes={result.items}
        initialClass={initialClass}
        initialSubject={initialSubject}
      />
    </div>
  );
}
