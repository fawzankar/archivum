use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource } from '@/lib/savedStorage';
import { useToast } from './ToastContext';
import { Bookmark, BookmarkCheck, ArrowUpRight, Check, FileText, Star } from 'lucide-react';

export default function ResourceCard({ resource, onView, compact = false }: { resource: Resource; onView?: (resource: Resource) => void; compact?: boolean }) {
  const [saved, setSaved] = useState(() => isResourceSaved(resource.id));
  const { showToast } = useToast();

  useEffect(() => {
    const sync = () => setSaved(isResourceSaved(resource.id));
    window.addEventListener('sjs_saved_updated', sync);
    return () => window.removeEventListener('sjs_saved_updated', sync);
  }, [resource.id]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const next = toggleSaveResource(resource); setSaved(next);
    showToast(next ? 'Saved to library' : 'Removed from saved', next ? 'success' : 'info');
  };

  const href = `/resource/${resource.slug || resource.id}`;
  const count = (n:number) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);

  return (
    <article className={`group flex flex-col border transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(17,24,39,.07)] ${compact ? '' : 'min-h-[300px]'}`} style={{background:'var(--surface)',borderColor:'var(--border)'}}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'var(--border-light)'}}>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.08em]" style={{color:'var(--ink-muted)'}}>
          <FileText className="w-3.5 h-3.5" /> {resource.resource_type || (resource.paper_type ? 'Exam paper' : 'Notes')}
        </div>
        <button onClick={toggle} aria-label={saved ? 'Remove from saved' : 'Save resource'} className="p-1.5 hover:text-[var(--accent)]" style={{color:saved?'var(--accent)':'var(--ink-faint)'}}>
          {saved ? <BookmarkCheck className="w-4 h-4"/> : <Bookmark className="w-4 h-4"/>}
        </button>
      </div>

      <Link href={href} onClick={onView ? e => { e.preventDefault(); onView(resource); } : undefined} className="flex-1 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[10px] mb-5" style={{color:'var(--ink-faint)'}}>
          <span>CLASS {resource.class_level}</span><span>·</span><span>{resource.subject}</span>
          {resource.chapter && <><span>·</span><span className="truncate">{resource.chapter}</span></>}
        </div>
        <h3 className="font-display text-xl leading-[1.2] pr-4 transition-colors group-hover:text-[var(--accent)]">{resource.title}</h3>
        <div className="flex items-center gap-1.5 mt-5 text-[10px] font-semibold" style={{color:'var(--sage)'}}><Check className="w-3 h-3"/> Verified</div>
      </Link>

      <div className="px-5 py-4 border-t flex items-center justify-between gap-3 text-[10px]" style={{borderColor:'var(--border-light)',color:'var(--ink-muted)'}}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1"><Star className="w-3 h-3" style={{color:resource.rating_count?'var(--accent)':'var(--ink-faint)',fill:resource.rating_count?'var(--accent)':'none'}}/>{resource.rating_count ? resource.average_rating.toFixed(1) : '—'}</span>
          <span>·</span><span>{resource.downloads ? `${count(resource.downloads)} downloads` : 'No downloads yet'}</span>
        </div>
        <Link href={href} className="shrink-0 inline-flex items-center gap-1 font-semibold" style={{color:'var(--ink)'}}>Open <ArrowUpRight className="w-3 h-3"/></Link>
      </div>
    </article>
  );
}
