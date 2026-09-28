'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource } from '@/lib/savedStorage';
import { useToast } from './ToastContext';
import { Bookmark, BookmarkCheck, ArrowUpRight, CheckCircle2, FileText, Star } from 'lucide-react';

export default function ResourceCard({ resource, onView, compact = false }: { resource: Resource; onView?: (resource: Resource) => void; compact?: boolean }) {
  const [saved,setSaved]=useState(()=>isResourceSaved(resource.id)); const {showToast}=useToast();
  useEffect(()=>{const sync=()=>setSaved(isResourceSaved(resource.id));window.addEventListener('sjs_saved_updated',sync);return()=>window.removeEventListener('sjs_saved_updated',sync)},[resource.id]);
  const toggle=(e:React.MouseEvent)=>{e.preventDefault();e.stopPropagation();const next=toggleSaveResource(resource);setSaved(next);showToast(next?'Saved to library':'Removed from saved',next?'success':'info')};
  const href=`/resource/${resource.slug||resource.id}`; const count=(n:number)=>n>=1000?`${(n/1000).toFixed(1)}K`:String(n);
  return <article className={`resource-card ${compact?'compact':''}`}>
    <div className="resource-card-top"><span className="resource-type"><FileText/> {resource.resource_type || (resource.paper_type?'Exam paper':'Notes')}</span><button onClick={toggle} aria-label={saved?'Remove from saved':'Save resource'} className={`resource-save ${saved?'saved':''}`}>{saved?<BookmarkCheck/>:<Bookmark/>}</button></div>
    <Link href={href} onClick={onView?e=>{e.preventDefault();onView(resource)}:undefined} className="resource-card-main">
      <div className="resource-meta">CLASS {resource.class_level}<span>•</span>{resource.subject}{resource.chapter&&<><span>•</span><em>{resource.chapter}</em></>}</div>
      <h3>{resource.title}</h3>
      <div className="resource-verified"><CheckCircle2/> Reviewed for the archive</div>
    </Link>
    <div className="resource-card-foot"><div className="resource-stats"><span><Star className={resource.rating_count?'filled':''}/>{resource.rating_count?resource.average_rating.toFixed(1):'—'}</span><span>{resource.downloads?`${count(resource.downloads)} downloads`:'New'}</span></div><span className="resource-open">Open <ArrowUpRight/></span></div>
  </article>;
}
