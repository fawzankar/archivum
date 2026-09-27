'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource } from '@/lib/savedStorage';
import { useToast } from './ToastContext';
import { ArrowUpRight, Bookmark, BookmarkCheck, FileText, Star } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onView?: (resource: Resource) => void;
  compact?: boolean;
  colorClass?: string;
}

export default function ResourceCard({ resource, onView, compact = false }: ResourceCardProps) {
  const [saved, setSaved] = useState(() => isResourceSaved(resource.id));
  const { showToast } = useToast();

  useEffect(() => {
    const handleUpdate = () => setSaved(isResourceSaved(resource.id));
    window.addEventListener('sjs_saved_updated', handleUpdate);
    return () => window.removeEventListener('sjs_saved_updated', handleUpdate);
  }, [resource.id]);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleSaveResource(resource);
    setSaved(next);
    showToast(next ? 'Saved to library' : 'Removed from saved', next ? 'success' : 'info');
  };

  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();
  const type = resource.resource_type || (resource.paper_type ? 'Exam paper' : 'Notes');

  return (
    <article className="premium-card group flex flex-col overflow-hidden select-none">
      <Link
        href={`/resource/${resource.slug || resource.id}`}
        onClick={onView ? (e) => { e.preventDefault(); onView(resource); } : undefined}
        className={`relative ${compact ? 'h-24' : 'h-28 sm:h-32'} premium-card-accent flex items-center px-5 sm:px-6`}
        style={{ background: 'var(--surface-raised)' }}
      >
        <div className="flex items-center gap-4">
          <span className="w-11 h-11 flex items-center justify-center border" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--accent)' }}><FileText className="w-5 h-5" /></span>
          <div><div className="text-[11px] font-semibold" style={{ color: 'var(--accent)' }}>{type}</div><div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Class {resource.class_level}</div></div>
        </div>
        <button onClick={handleSaveToggle} title={saved ? 'Remove from saved' : 'Save resource'} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center border" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: saved ? 'var(--accent)' : 'var(--ink-muted)' }}>
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </Link>

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <Link href={`/resource/${resource.slug || resource.id}`} onClick={onView ? (e) => { e.preventDefault(); onView(resource); } : undefined}>
          <h3 className="font-display font-bold text-lg sm:text-xl leading-tight line-clamp-2" style={{ color: 'var(--ink)' }}>{resource.title}</h3>
        </Link>
        <p className="text-xs mt-3 line-clamp-2 leading-5" style={{ color: 'var(--ink-muted)' }}>
          {resource.subject}{resource.chapter ? ` — ${resource.chapter}` : ''}
        </p>
        <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--ink-faint)' }}>
          {resource.contributor_name ? `Shared by ${resource.contributor_name}` : resource.school_name ? resource.school_name : 'JKBOSE study material'}
        </p>

        <div className="mt-6 pt-4 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--ink-muted)' }}>
            <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5" style={{ color: resource.rating_count ? 'var(--accent)' : 'var(--ink-faint)', fill: resource.rating_count ? 'var(--accent)' : 'transparent' }} />{resource.rating_count ? resource.average_rating.toFixed(1) : 'Not rated'}</span>
            <span>{resource.downloads ? `${formatCount(resource.downloads)} downloads` : 'No downloads'}</span>
          </div>
          {onView ? <button onClick={() => onView(resource)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--accent)' }}>Open <ArrowUpRight className="w-3.5 h-3.5" /></button> : <Link href={`/resource/${resource.slug || resource.id}`} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--accent)' }}>Open <ArrowUpRight className="w-3.5 h-3.5" /></Link>}
        </div>
      </div>
    </article>
  );
}
