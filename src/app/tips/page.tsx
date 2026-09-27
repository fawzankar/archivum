import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import { getTips } from '@/lib/tips';
import TipsClient from './TipsClient';
export const revalidate=0;
export default async function TipsPage({searchParams}:{searchParams:Promise<{class?:string;subject?:string}>}){
 const params=await searchParams; const preferred=await getPreferredClass(); const selected=Number(params.class)||preferred||10; const subject=typeof params.subject==='string'?params.subject:'';
 const tips=await getTips([9,10,11,12].includes(selected)?selected:10,subject||undefined,12);
 return <div className="page-shell"><div className="page-intro"><div><h1 className="font-display">Small things that can make revision easier.</h1><p>Tips are short on purpose: a useful way to remember a chapter, approach a paper, revise before an annual exam, or avoid a mistake another student has already made.</p></div><div className="page-note">Choose Class {selected} and a subject to see the tips that match your current study list.</div></div><div className="mt-10"><TipsClient initialTips={tips} initialClass={selected}/></div></div>;
}
