'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource } from '@/lib/savedStorage';
import { useToast } from './ToastContext';
import { Bookmark, BookmarkCheck, ArrowUpRight, CheckCircle2, FileText, Star } from 'lucide-react';

export default function ResourceCard({ resource, onView, compact = false }: { resource: Resource; onView?: (resource: Resource) => void; compact?: boolean }) {
  const [saved,setSaved]=useState(()=>isResourceSaved(resource.id)); const {showToast}=useToast(); const router=useRouter();
  useEffect(()=>{const sync=()=>setSaved(isResourceSaved(resource.id));window.addEventListener('sjs_saved_updated',sync);return()=>window.removeEventListener('sjs_saved_updated',sync)},[resource.id]);
  const toggle=(e:React.MouseEvent)=>{e.preventDefault();e.stopPropagation();const next=toggleSaveResource(resource);setSaved(next);showToast(next?'Saved to library':'Removed from saved',next?'success':'info')};
  const href=`/resource/${resource.slug||resource.id}`; const count=(n:number)=>n>=1000?`${(n/1000).toFixed(1)}K`:String(n);
  const prime=()=>router.prefetch(href);
  const openFromCard=(e:React.MouseEvent<HTMLElement>)=>{ const target=e.target as HTMLElement; if(target.closest('button,a')) return; router.push(href); };
  return <article className={`resource-card ${compact?'compact':''}`} role="link" tabIndex={0} onPointerDown={prime} onClick={openFromCard} onKeyDown={e=>{if((e.key==='Enter'||e.key===' ') && e.target===e.currentTarget){e.preventDefault();router.push(href)}}}>
    <div className="resource-card-top"><span className="resource-type"><FileText/> {resource.resource_type || (resource.paper_type?'Exam paper':'Notes')}</span><button onClick={toggle} aria-label={saved?'Remove from saved':'Save resource'} className={`resource-save ${saved?'saved':''}`}>{saved?<BookmarkCheck/>:<Bookmark/>}</button></div>
    <Link href={href} onClick={onView?e=>{e.preventDefault();onView(resource)}:undefined} className="resource-card-main">
      <div className="resource-meta">CLASS {resource.class_level}<span>•</span>{resource.subject}{resource.chapter&&<><span>•</span><em>{resource.chapter}</em></>}</div>
      <h3>{resource.title}</h3>
      <div className="resource-verified"><CheckCircle2/> Reviewed for the archive</div>
    </Link>
    <div className="resource-card-foot"><div className="resource-stats"><span><Star className={resource.rating_count?'filled':''}/>{resource.rating_count?resource.average_rating.toFixed(1):'—'}</span><span>{resource.downloads?`${count(resource.downloads)} downloads`:'New'}</span></div><span className="resource-open">Open <ArrowUpRight/></span></div>
  </article>;
}
