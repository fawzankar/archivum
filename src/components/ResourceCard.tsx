'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource } from '@/lib/savedStorage';
import { useToast } from './ToastContext';
import { Bookmark, BookmarkCheck, FileText, Check, Star, ArrowUpRight } from 'lucide-react';

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

  return (
    <article className={`resource-card-premium ${compact ? 'resource-card-compact' : ''}`}>
      <Link
        href={`/resource/${resource.slug || resource.id}`}
        className="resource-card-media"
        onClick={onView ? (e) => { e.preventDefault(); onView(resource); } : undefined}
      >
        <span className="resource-card-file"><FileText /></span>
        <span className="resource-card-type">{resource.resource_type || (resource.paper_type ? 'Exam paper' : 'Notes')}</span>
        <button
          type="button"
          onClick={handleSaveToggle}
          title={saved ? 'Remove from saved' : 'Save resource'}
          aria-label={saved ? 'Remove from saved' : 'Save resource'}
          className="resource-card-save"
        >
          {saved ? <BookmarkCheck /> : <Bookmark />}
        </button>
      </Link>

      <div className="resource-card-body">
        <div className="resource-card-meta">
          <span>{resource.subject}</span>
          <span className="resource-card-verified"><Check /> Reviewed</span>
        </div>

        <Link
          href={`/resource/${resource.slug || resource.id}`}
          onClick={onView ? (e) => { e.preventDefault(); onView(resource); } : undefined}
          className="resource-card-title-link"
        >
          <h3>{resource.title}</h3>
        </Link>

        <p className="resource-card-context">
          Class {resource.class_level}
          {resource.chapter ? ` / ${resource.chapter}` : ''}
          {resource.contributor_name ? ` / ${resource.contributor_name}` : resource.school_name ? ` / ${resource.school_name}` : ''}
        </p>

        <div className="resource-card-footer">
          <div className="resource-card-stats">
            <span><Star className={resource.rating_count > 0 ? 'is-rated' : ''} /> {resource.rating_count > 0 ? resource.average_rating.toFixed(1) : 'No ratings'}</span>
            <span>{resource.downloads > 0 ? `${formatCount(resource.downloads)} downloads` : 'No downloads yet'}</span>
          </div>

          {onView ? (
            <button type="button" onClick={() => onView(resource)} className="resource-card-open">
              Open <ArrowUpRight />
            </button>
          ) : (
            <Link href={`/resource/${resource.slug || resource.id}`} className="resource-card-open">
              Open <ArrowUpRight />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
