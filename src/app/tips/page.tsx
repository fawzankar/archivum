import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import { getTips } from '@/lib/tips';
import TipsClient from './TipsClient';

export const revalidate = 0;

export default async function TipsPage({ searchParams }: { searchParams: Promise<{ class?: string; subject?: string }> }) {
  const params = await searchParams;
  const selected = params.class ? parseInt(params.class, 10) : (await getPreferredClass()) || 10;
  const tips = await getTips(selected, params.subject);
  return (
    <div className="archive-shell">
      <div className="page-heading">
        <span className="eyebrow">Class {selected} tips</span>
        <h1>Small things that can make revision easier.</h1>
        <p>Short, practical advice for studying, revising chapters, working through papers and getting ready for exams.</p>
      </div>
      <div className="py-8">
        <TipsClient initialTips={tips} initialClass={selected} />
      </div>
    </div>
  );
}
