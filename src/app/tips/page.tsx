import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import PageHead from '@/components/PageHead';
import { getTipsForPage } from '@/lib/tips';
import TipsClient from './TipsClient';

export const revalidate=300;
export default async function TipsPage({searchParams}:{searchParams:Promise<{class?:string; subject?:string}>}){
 const params=await searchParams; const preferred=await getPreferredClass(); const selected=Number(params.class)||preferred||10; const subject=typeof params.subject==='string'?params.subject:'';
 const tips=await getTipsForPage([9,10,11,12].includes(selected)?selected:10,subject||undefined,12);
 return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8"><PageHead title="Tips & Tricks from the SJS community." art="Maths" tone="blush">Short, practical study moves for revision, papers and exam day. Community tips are checked before they appear.</PageHead><TipsClient initialTips={tips} initialClass={selected}/></div>;
}
