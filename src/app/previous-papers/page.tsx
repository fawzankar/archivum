import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import { getResources } from '@/lib/resources';
import PaperFinderClient from './PaperFinderClient';
export const revalidate=0;
export default async function PreviousPapersPage({searchParams}:{searchParams:Promise<{class?:string;subject?:string;paperType?:string;year?:string;school?:string}>}){
 const params=await searchParams; const selectedClass=params.class?parseInt(params.class,10):await getPreferredClass();
 const result=await getResources({resource_type:'Previous Year Paper',class_level:selectedClass,limit:100});
 return <div className="page-shell"><div className="page-intro"><div><h1 className="font-display">Previous papers for practice.</h1><p>The archive groups papers by class and subject, including board, pre-board, unit test, half-yearly, annual/final, school exam and sample papers where those materials have been uploaded.</p></div><div className="page-note">For the current syllabus and official exam notices, check JKBOSE notices alongside any paper saved here.</div></div><div className="mt-10"><PaperFinderClient allPapers={result.items} initialClass={selectedClass} initialSubject={params.subject} initialPaperType={params.paperType} initialYear={params.year?parseInt(params.year,10):undefined} initialSchool={params.school}/></div></div>;
}
