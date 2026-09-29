import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import { getTips } from '@/lib/tips';
import TipsClient from './TipsClient';

export const revalidate=0;
export default async function TipsPage({searchParams}:{searchParams:Promise<{class?:string; subject?:string}>}){
 const params=await searchParams; const preferred=await getPreferredClass(); const selected=Number(params.class)||preferred||10; const subject=typeof params.subject==='string'?params.subject:'';
 const tips=await getTips([9,10,11,12].includes(selected)?selected:10,subject||undefined,12);
 return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8"><div className="max-w-3xl space-y-3"><span className="text-[10px] font-bold" style={{color:'var(--accent)'}}>Exam playbook · CLASS {selected}</span><h1 className="font-display font-bold text-4xl sm:text-5xl">Tips & Tricks from the SJS community.</h1><p className="text-sm sm:text-base leading-relaxed" style={{color:'var(--ink-muted)'}}>Short, practical study moves for revision, papers and exam-day preparation. Tips are class-specific and community submissions are moderated before they appear.</p></div><TipsClient initialTips={tips} initialClass={selected}/></div>;
}
