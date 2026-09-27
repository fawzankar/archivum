'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource } from '@/lib/savedStorage';
import { useToast } from './ToastContext';
import { Bookmark, BookmarkCheck, FileText, Check } from 'lucide-react';

interface ResourceCardProps { resource: Resource; onView?: (resource: Resource) => void; compact?: boolean; colorClass?: string; }

export default function ResourceCard({ resource, onView }: ResourceCardProps) {
  const [saved,setSaved] = useState(() => isResourceSaved(resource.id));
  const {showToast} = useToast();
  useEffect(() => { const h=()=>setSaved(isResourceSaved(resource.id)); window.addEventListener('sjs_saved_updated',h); return()=>window.removeEventListener('sjs_saved_updated',h); },[resource.id]);
  const handleSave=(e:React.MouseEvent)=>{e.preventDefault();e.stopPropagation();const now=toggleSaveResource(resource);setSaved(now);showToast(now?'Saved to library':'Removed from saved',now?'success':'info');};
  const formatCount=(n:number)=>n>=1000?`${(n/1000).toFixed(1)}K`:n.toString();
  const href=`/resource/${resource.slug || resource.id}`;
  return <article className="group relative flex flex-col border select-none" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
    <Link href={href} onClick={onView?(e=>{e.preventDefault();onView(resource);}):undefined} className="relative h-24 sm:h-28 w-full flex items-center gap-4 border-b px-5" style={{background:'var(--surface-raised)',borderColor:'var(--border)'}}>
      <span className="w-10 h-10 flex items-center justify-center border" style={{borderColor:'var(--border)',background:'var(--surface)',color:'var(--accent)'}}><FileText className="w-5 h-5"/></span>
      <div><div className="text-xs font-medium" style={{color:'var(--accent)'}}>PDF</div><div className="text-xs mt-0.5" style={{color:'var(--ink-muted)'}}>{resource.resource_type || (resource.paper_type ? 'Exam paper' : 'Notes')}</div></div>
      <button onClick={handleSave} title={saved?'Remove from saved':'Save resource'} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border" style={{borderColor:'var(--border)',background:'var(--surface)',color:saved?'var(--rose)':'var(--ink-muted)'}}>{saved?<BookmarkCheck className="w-4 h-4"/>:<Bookmark className="w-4 h-4"/>}</button>
    </Link>
    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-center gap-2 text-xs" style={{color:'var(--ink-muted)'}}><Check className="w-3.5 h-3.5" style={{color:'var(--accent)'}}/> Approved resource</div>
      <Link href={href} onClick={onView?(e=>{e.preventDefault();onView(resource);}):undefined}><h3 className="font-display text-lg leading-snug mt-3 line-clamp-2" style={{color:'var(--ink)'}}>{resource.title}</h3></Link>
      <p className="text-xs leading-5 mt-3 line-clamp-2" style={{color:'var(--ink-muted)'}}>Class {resource.class_level} / {resource.subject}{resource.chapter?` / ${resource.chapter}`:''}{resource.contributor_name?` / ${resource.contributor_name}`:resource.school_name?` / ${resource.school_name}`:''}</p>
      <div className="mt-5 pt-4 border-t flex items-center justify-between gap-3 text-xs" style={{borderColor:'var(--border-light)'}}>
        <span style={{color:'var(--ink-muted)'}}>{resource.rating_count>0?`${resource.average_rating.toFixed(1)} rating · ${resource.rating_count}`:'No ratings'}{resource.downloads>0?` · ${formatCount(resource.downloads)} downloads`:''}</span>
        {onView?<button onClick={()=>onView(resource)} className="font-medium" style={{color:'var(--accent)'}}>Preview</button>:<Link href={href} className="font-medium" style={{color:'var(--accent)'}}>Open</Link>}
      </div>
    </div>
  </article>;
}
