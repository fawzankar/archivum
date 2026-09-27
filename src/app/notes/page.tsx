import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import { getResources } from '@/lib/resources';
import NotesClient from './NotesClient';
export const revalidate=0;
export default async function NotesPage({searchParams}:{searchParams:Promise<{class?:string;subject?:string}>}){
 const params=await searchParams; const initialClass=params.class?parseInt(params.class,10):(await getPreferredClass())||10;
 const result=await getResources({resource_type:'Notes',limit:100});
 return <div className="page-shell"><div className="page-intro"><div><h1 className="font-display">Notes you can actually revise from.</h1><p>Chapter notes, summaries and revision material arranged by class and subject. For Classes 9–10, that means the familiar Mathematics, Science, Social Science, English, Hindi and Urdu set; Classes 11–12 are organised around Mathematics, Biology, Physics, Chemistry and English.</p></div><div className="page-note">Use the class and subject filters to narrow the archive before opening a resource.</div></div><div className="mt-10"><NotesClient allNotes={result.items} initialClass={initialClass} initialSubject={params.subject||''}/></div></div>;
}
