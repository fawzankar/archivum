import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import { getResources } from '@/lib/resources';
import NotesClient from './NotesClient';

export const revalidate = 0;

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ class?: string; subject?: string }> }) {
  const params = await searchParams;
  const initialClass = params.class ? parseInt(params.class, 10) : (await getPreferredClass()) || 10;
  const result = await getResources({ resource_type: 'Notes', limit: 100 });

  return (
    <div className="archive-shell">
      <div className="page-heading">
        <span className="eyebrow">Class {initialClass} notes</span>
        <h1>Notes you can come back to.</h1>
        <p>Chapter summaries, explanations and revision material arranged by subject for Classes 9–12.</p>
      </div>
      <NotesClient allNotes={result.items} initialClass={initialClass} initialSubject={params.subject || ''} />
    </div>
  );
}
