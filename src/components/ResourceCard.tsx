'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource } from '@/lib/savedStorage';
import { useToast } from './ToastContext';
import { Bookmark, BookmarkCheck, FileText, Check, Star, ArrowRight } from 'lucide-react';

export default function ResourceCard({ resource, onView, compact = false }: { resource: Resource; onView?: (resource: Resource)=>void; compact?: boolean }) {
  const [saved,setSaved] = useState(()=>isResourceSaved(resource.id));
  const { showToast } = useToast();
  useEffect(()=>{ const f=()=>setSaved(isResourceSaved(resource.id)); window.addEventListener('sjs_saved_updated',f); return ()=>window.removeEventListener('sjs_saved_updated',f); },[resource.id]);
  const save=(e:React.MouseEvent)=>{ e.preventDefault();e.stopPropagation();const next=toggleSaveResource(resource);setSaved(next);showToast(next?'Saved to library 🔖':'Removed from saved',next?'success':'info'); };
  const count=(n:number)=>n>=1000?(n/1000).toFixed(1)+'K':n.toString();
  const href=`/resource/${resource.slug || resource.id}`;
  return <article className={`resource-card group ${compact?'compact':''}`}>
    <Link href={href} onClick={onView?(e)=>{e.preventDefault();onView(resource)}:undefined} className={`resource-cover ${compact?'min-h-[112px]':''}`}>
      <div className="relative z-[1]">
        <FileText className="w-7 h-7 mb-3" strokeWidth={1.35}/>
        <div className="text-[9px] uppercase tracking-[.18em] font-bold">{resource.resource_type || (resource.paper_type?'Exam Paper':'Notes')}</div>
      </div>
      <button onClick={save} title={saved?'Remove from saved':'Save resource'} className="absolute z-[2] top-4 right-4 w-8 h-8 border border-white/20 bg-black/10 flex items-center justify-center text-white backdrop-blur-sm">
        {saved?<BookmarkCheck className="w-3.5 h-3.5"/>:<Bookmark className="w-3.5 h-3.5"/>}
      </button>
    </Link>
    <div className="resource-body">
      <div className="flex items-center justify-between gap-3"><span className="resource-type">{resource.paper_type || 'Archive item'}</span><span className="resource-verified"><Check className="inline w-3 h-3 mr-1"/>{resource.rating_count>0?'Verified':'Reviewed'}</span></div>
      <Link href={href} onClick={onView?(e)=>{e.preventDefault();onView(resource)}:undefined}><h3 className="resource-title line-clamp-2">{resource.title}</h3></Link>
      <div className="resource-meta line-clamp-2">Class {resource.class_level} · {resource.subject}{resource.chapter?` · ${resource.chapter}`:''}{resource.contributor_name?` · ${resource.contributor_name}`:resource.school_name?` · ${resource.school_name}`:' · JKBOSE'}</div>
      <div className="resource-footer">
        <div className="flex items-center gap-1.5 min-w-0"><Star className="w-3 h-3 shrink-0" style={{color:resource.rating_count?'var(--gold)':'var(--line)',fill:resource.rating_count?'var(--gold)':'transparent'}}/><span style={{color:'var(--ink)'}}>{resource.rating_count?resource.average_rating.toFixed(1):'—'}</span><span>·</span><span>{resource.downloads?`${count(resource.downloads)} downloads`:'No downloads yet'}</span></div>
        {onView?<button onClick={()=>onView(resource)} className="inline-flex items-center gap-1 font-semibold" style={{color:'var(--accent)'}}>Preview <ArrowRight className="w-3 h-3"/></button>:<Link href={href} className="inline-flex items-center gap-1 font-semibold" style={{color:'var(--accent)'}}>Open <ArrowRight className="w-3 h-3"/></Link>}
      </div>
    </div>
  </article>;
}
