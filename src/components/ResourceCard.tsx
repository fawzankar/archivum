'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource } from '@/lib/savedStorage';
import { useToast } from './ToastContext';
import Art from './Art';
import { Bookmark, BookmarkCheck, ArrowUpRight, Star } from 'lucide-react';

export default function ResourceCard({ resource, onView, compact = false }: { resource: Resource; onView?: (resource: Resource) => void; compact?: boolean }) {
  const [saved,setSaved]=useState(()=>isResourceSaved(resource.id)); const {showToast}=useToast(); const router=useRouter();
  useEffect(()=>{const sync=()=>setSaved(isResourceSaved(resource.id));window.addEventListener('sjs_saved_updated',sync);return()=>window.removeEventListener('sjs_saved_updated',sync)},[resource.id]);
  const toggle=(e:React.MouseEvent)=>{e.preventDefault();e.stopPropagation();const next=toggleSaveResource(resource);setSaved(next);showToast(next?'Saved to library':'Removed from saved',next?'success':'info')};
  const href=`/resource/${resource.slug||resource.id}`; const count=(n:number)=>n>=1000?`${(n/1000).toFixed(1)}K`:String(n);
  const isPaper=Boolean(resource.paper_type) || resource.resource_type === 'Previous Year Paper'; const tone=[...(resource.subject||'')].reduce((a,c)=>a+c.charCodeAt(0),0)%4; const prime=()=>router.prefetch(href); const artName=isPaper?'papers':(resource.subject||'notes').trim();
  const openFromCard=(e:React.MouseEvent<HTMLElement>)=>{ const target=e.target as HTMLElement; if(target.closest('button,a')) return; router.push(href); };
  return <article className={`resource-card rc ${compact?'compact':''}`} role="link" tabIndex={0} onPointerDown={prime} onMouseEnter={prime} onClick={openFromCard} onKeyDown={e=>{if((e.key==='Enter'||e.key===' ') && e.target===e.currentTarget){e.preventDefault();router.push(href)}}}>
    <div className={`rc-top rc-c${tone}`}><Art name={artName} className="rc-art"/><span className="rc-kind">{isPaper?'Exam paper':(resource.resource_type||'Notes')}</span><button onClick={toggle} aria-label={saved?'Remove from saved':'Save resource'} className={`resource-save rc-save ${saved?'saved':''}`}>{saved?<BookmarkCheck/>:<Bookmark/>}</button></div>
    <Link href={href} onClick={onView?e=>{e.preventDefault();onView(resource)}:undefined} className="rc-body">
      <h3>{resource.title}</h3>
      <div className="rc-chips"><span>Class {resource.class_level}</span><span>{resource.subject}</span>{resource.chapter&&<span>{resource.chapter}</span>}</div>
    </Link>
    <div className="rc-foot"><span className="rc-rate"><Star className={resource.rating_count?'filled':''}/>{resource.rating_count?resource.average_rating.toFixed(1):'Not rated yet'}</span><span className="rc-open">Open <ArrowUpRight/></span></div>
  </article>;
}
