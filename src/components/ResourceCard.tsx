'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource } from '@/lib/savedStorage';
import { useToast } from './ToastContext';
import { Bookmark, BookmarkCheck, FileText, Star } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onView?: (resource: Resource) => void;
  compact?: boolean;
  colorClass?: string;
}

export default function ResourceCard({ resource, onView }: ResourceCardProps) {
  const [saved, setSaved] = useState(() => isResourceSaved(resource.id));
  const { showToast } = useToast();

  useEffect(() => {
    const update = () => setSaved(isResourceSaved(resource.id));
    window.addEventListener('sjs_saved_updated', update);
    return () => window.removeEventListener('sjs_saved_updated', update);
  }, [resource.id]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleSaveResource(resource);
    setSaved(next);
    showToast(next ? 'Saved to your library' : 'Removed from saved', next ? 'success' : 'info');
  };

  const open = (e?: React.MouseEvent) => {
    if (onView && e) {
      e.preventDefault();
      onView(resource);
    }
  };

  const count = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

  return (
    <article className="resource-card">
      <div className="resource-card__top">
        <div className="flex items-center gap-3">
          <span className="flex w-9 h-9 items-center justify-center border" style={{borderColor:'var(--border)',borderRadius:'7px',color:'var(--accent)',background:'var(--surface)'}}>
            <FileText className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs font-semibold">{resource.resource_type || (resource.paper_type ? 'Exam paper' : 'Notes')}</div>
            <div className="text-[11px]" style={{color:'var(--ink-muted)'}}>Class {resource.class_level}</div>
          </div>
        </div>
        <button onClick={handleSave} className="icon-button header-icon" aria-label={saved ? 'Remove from saved' : 'Save resource'}>
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      <div className="resource-card__body">
        <Link href={`/resource/${resource.slug || resource.id}`} onClick={onView ? open : undefined}>
          <h3 className="resource-card__title">{resource.title}</h3>
        </Link>

        <p className="resource-card__meta mt-2">
          {resource.subject}
          {resource.chapter ? ` — ${resource.chapter}` : ''}
        </p>

        <p className="resource-card__meta mt-3">
          {resource.contributor_name
            ? `Shared by ${resource.contributor_name}`
            : resource.school_name
              ? resource.school_name
              : 'SJS archive'}
        </p>

        <div className="resource-card__footer">
          <span className="inline-flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" style={{color:resource.rating_count ? 'var(--accent)' : 'var(--ink-faint)', fill:resource.rating_count ? 'var(--accent)' : 'none'}} />
            {resource.rating_count ? `${resource.average_rating.toFixed(1)} (${resource.rating_count})` : 'No ratings'}
          </span>
          <span>{resource.downloads ? `${count(resource.downloads)} downloads` : 'No downloads yet'}</span>
          <Link href={`/resource/${resource.slug || resource.id}`} onClick={onView ? open : undefined} className="inline-flex items-center gap-1 font-medium" style={{color:'var(--accent)'}}>
            Open
          </Link>
        </div>
      </div>
    </article>
  );
}
