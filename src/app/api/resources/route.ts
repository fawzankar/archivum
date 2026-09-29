import { NextResponse } from 'next/server';
import { getResources } from '@/lib/resources';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  try { const p=new URL(request.url).searchParams; const int=(v:string|null)=>v?parseInt(v,10):undefined; const sort=p.get('sort'); const sortBy=['relevance','newest','downloads','rating'].includes(sort||'')?sort as 'relevance'|'newest'|'downloads'|'rating':undefined; const result = await getResources({class_level:int(p.get('class')),subject:p.get('subject')||undefined,resource_type:p.get('type')||undefined,paper_type:p.get('paperType')||undefined,year:int(p.get('year')),school_name:p.get('school')||undefined,chapter:p.get('chapter')||undefined,topic:p.get('topic')||undefined,search:p.get('q')||undefined,status:'approved',featured:p.get('featured')==='true'?true:undefined,sortBy,page:int(p.get('page'))||1,limit:int(p.get('limit'))||12});
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
    return response; } catch(e){ return NextResponse.json({error:e instanceof Error?e.message:'Internal Server Error'},{status:500}); }
}
