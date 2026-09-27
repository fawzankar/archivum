import React from 'react';
import { getPreferredClass } from '@/lib/studentClass';
import { getResources } from '@/lib/resources';
import SearchClient from './SearchClient';
export const revalidate=0;
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string;class?:string;subject?:string;type?:string;paperType?:string;year?:string;school?:string;sort?:string;page?:string}>}){
 const params=await searchParams; const q=params.q||''; const class_level=params.class?parseInt(params.class,10):await getPreferredClass(); const subject=params.subject||undefined; const resource_type=params.type||undefined; const paper_type=params.paperType||undefined; const year=params.year?parseInt(params.year,10):undefined; const school_name=params.school||undefined; const sortBy=(params.sort as any)||(q?'relevance':'newest'); const page=params.page?parseInt(params.page,10):1;
 const initialResults=await getResources({search:q,class_level,subject,resource_type,paper_type,year,school_name,sortBy,page,limit:12});
 return <div className="page-shell"><div className="page-intro"><div><h1 className="font-display">Search the archive.</h1><p>Look for a chapter, topic, paper, school exam, contributor or subject. Search works across the same class and subject filters used by the archive.</p></div><div className="page-note">Try a specific phrase such as “quadratic equations”, “electrostatics” or a paper year.</div></div><div className="mt-10"><SearchClient initialQuery={q} initialClass={class_level} initialSubject={subject} initialType={resource_type} initialPaperType={paper_type} initialYear={year} initialSchool={school_name} initialSort={sortBy} initialData={initialResults}/></div></div>;
}
