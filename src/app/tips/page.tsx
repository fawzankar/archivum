import React from 'react';
import PageHead from '@/components/PageHead';
import { getTipsBundle } from '@/lib/tips';
import TipsClient from './TipsClient';
import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Tips',
  description: 'Study tips, exam strategies and shortcuts shared by students for Classes 9 to 12. Learn how to revise smarter before boards and annual exams.',
  keywords: ['exam tips', 'study tips for students', 'board exam preparation', 'revision tricks', 'how to score well in exams'],
  alternates: { canonical: '/tips' },
  openGraph: { title: 'Exam Tips & Tricks | ARCHIVUM', description: 'Student-shared study tips and exam strategies.', url: '/tips', type: 'website', images: [OG_IMAGE] },
};

export const revalidate=300;

export default async function TipsPage(){
 const tips=await getTipsBundle();
 return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8"><PageHead title="Tips & Tricks from the SJS community." art="tips" tone="blush">Short, practical study moves for revision, papers and exam day. Community tips are checked before they appear.</PageHead><TipsClient initialTips={tips} initialClass={10}/></div>;
}
