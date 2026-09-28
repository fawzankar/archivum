import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import { getResources } from '@/lib/resources';
import NotesClient from './NotesClient';

export const revalidate = 0;

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; subject?: string }>;
}) {
  const params = await searchParams;
  const initialClass = params.class ? parseInt(params.class, 10) : (await getPreferredClass()) || 10;
  const initialSubject = params.subject || '';

  const result = await getResources({ resource_type: 'Notes', limit: 100 });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {}
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          ACADEMIC REPOSITORY
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Notes Library
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
          Structured chapter notes, theory summaries, and revision guides curated for JKBOSE Classes 9 to 12.
        </p>
      </div>

      <NotesClient
        allNotes={result.items}
        initialClass={initialClass}
        initialSubject={initialSubject}
      />
    </div>
  );
}
