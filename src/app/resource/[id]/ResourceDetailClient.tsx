'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource, addRecentlyViewed } from '@/lib/savedStorage';
import ResourceCard from '@/components/ResourceCard';
import { useToast } from '@/components/ToastContext';
import { 
  Download, 
  Eye, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Share2, 
  ArrowLeft,
} from 'lucide-react';

interface ResourceDetailProps {
  resource: Resource;
  relatedResources: Resource[];
}


export default function ResourceDetailClient({ resource, relatedResources }: ResourceDetailProps) {
  const [saved, setSaved] = useState(() => isResourceSaved(resource.id));
  const [downloads, setDownloads] = useState(resource.downloads);
  const [userRating, setUserRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(resource.average_rating);
  const [ratingCount, setRatingCount] = useState<number>(resource.rating_count);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    addRecentlyViewed(resource);
  }, [resource]);


  const handleSaveToggle = () => {
    const isNowSaved = toggleSaveResource(resource);
    setSaved(isNowSaved);
    showToast(isNowSaved ? 'Saved to library 🔖' : 'Removed from saved', isNowSaved ? 'success' : 'info');
  };

  const handleDownload = async () => {
    let downloadUrl = `/api/resources/${resource.id}/file`;
    try {
      let sessionId = localStorage.getItem('sjs_session_id');
      if (!sessionId) {
        sessionId = 'session_' + (crypto.randomUUID());
        localStorage.setItem('sjs_session_id', sessionId);
      }

      const response = await fetch(`/api/download/${resource.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const result = await response.json().catch(() => ({}));
      downloadUrl = result.download_url || downloadUrl;
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Download could not be started');
      }

      setDownloads(result.downloads ?? resource.downloads);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = resource.file_name || resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Downloading document... 📥');
    } catch {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleRating = async (rating: number) => {
    if (ratingSubmitted || ratingSaving) return;
    setRatingSaving(true);
    setUserRating(rating);

    // Optimistic display: reflect the user's rating immediately, then reconcile
    // with the authoritative server aggregate.
    const previousCount = ratingCount;
    const previousAverage = avgRating;
    const optimisticCount = previousCount + 1;
    const optimisticAverage = previousCount > 0
      ? ((previousAverage * previousCount) + rating) / optimisticCount
      : rating;
    setRatingCount(optimisticCount);
    setAvgRating(optimisticAverage);

    try {
      let sessionId = localStorage.getItem('sjs_session_id');
      if (!sessionId) {
        sessionId = 'session_' + (crypto.randomUUID());
        localStorage.setItem('sjs_session_id', sessionId);
      }

      const res = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: resource.id, rating, sessionId }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'Could not record rating');
      }

      setAvgRating(json.average_rating);
      setRatingCount(json.rating_count);
      setRatingSubmitted(true);
      showToast('Rating saved ✓', 'success');
    } catch {
      setUserRating(0);
      setAvgRating(previousAverage);
      setRatingCount(previousCount);
      showToast('Could not record rating', 'error');
    } finally {
      setRatingSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: `Check out ${resource.title} on ARCHIVUM`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard! 📋');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'PDF Document';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="archive-shell py-8 sm:py-12">
      <div className="mb-6">
        <Link href="/notes" className="inline-flex items-center gap-2 text-sm font-medium" style={{color:'var(--ink-muted)'}}>
          <ArrowLeft className="w-4 h-4" /> Back to notes
        </Link>
      </div>

      <article className="archive-surface overflow-hidden">
        <header className="p-6 sm:p-9 border-b" style={{borderColor:'var(--border)'}}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-7">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm mb-4" style={{color:'var(--ink-muted)'}}>
                <span>Class {resource.class_level}</span>
                <span>{resource.subject}</span>
                {resource.resource_type && <span>{resource.resource_type}</span>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">{resource.title}</h1>
              <p className="mt-4 text-sm leading-6 max-w-2xl" style={{color:'var(--ink-muted)'}}>
                {resource.description || 'Academic material shared with the ARCHIVUM community.'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={handleShare} className="btn btn-secondary" title="Share"><Share2 className="w-4 h-4" /> Share</button>
              <button onClick={handleSaveToggle} className="btn btn-secondary" title={saved ? 'Remove from saved' : 'Save to library'}>
                {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-9">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-7 border-b" style={{borderColor:'var(--border)'}}>
            <button onClick={handleDownload} className="btn btn-primary"><Download className="w-4 h-4" /> Download PDF</button>
            <a href={`/api/resources/${resource.id}/file`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary"><Eye className="w-4 h-4" /> Read online</a>
            <div className="sm:ml-auto text-sm" style={{color:'var(--ink-muted)'}}>
              {downloads} downloads · {formatFileSize(resource.file_size)}
            </div>
          </div>

          <dl className="grid sm:grid-cols-2 lg:grid-cols-4 border-b" style={{borderColor:'var(--border)'}}>
            <div className="py-5 sm:pr-5 sm:border-r" style={{borderColor:'var(--border-light)'}}>
              <dt className="text-xs" style={{color:'var(--ink-faint)'}}>Board</dt>
              <dd className="mt-1 text-sm font-medium">{resource.board || 'JKBOSE'}</dd>
            </div>
            <div className="py-5 sm:px-5 lg:border-r" style={{borderColor:'var(--border-light)'}}>
              <dt className="text-xs" style={{color:'var(--ink-faint)'}}>Category</dt>
              <dd className="mt-1 text-sm font-medium">{resource.resource_type || 'Study material'}</dd>
            </div>
            <div className="py-5 sm:px-5 sm:border-r" style={{borderColor:'var(--border-light)'}}>
              <dt className="text-xs" style={{color:'var(--ink-faint)'}}>Chapter or topic</dt>
              <dd className="mt-1 text-sm font-medium truncate">{resource.chapter || resource.topic || 'General'}</dd>
            </div>
            <div className="py-5 sm:pl-5">
              <dt className="text-xs" style={{color:'var(--ink-faint)'}}>Contributor</dt>
              <dd className="mt-1 text-sm font-medium truncate">{resource.contributor_name || resource.school_name || 'ARCHIVUM contributor'}</dd>
            </div>
          </dl>

          <div className="py-7 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-5" style={{borderColor:'var(--border)'}}>
            <div>
              <h2 className="text-lg font-semibold">Was this resource useful?</h2>
              <p className="text-sm mt-1" style={{color:'var(--ink-muted)'}}>
                {ratingCount > 0 ? `${avgRating.toFixed(1)} out of 5 from ${ratingCount} rating${ratingCount === 1 ? '' : 's'}.` : 'No ratings yet.'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => handleRating(star)} className="p-1" title={ratingSaving ? 'Saving rating' : `Rate ${star} stars`} disabled={ratingSubmitted}>
                  <Star className="w-5 h-5" style={{color:(userRating >= star || avgRating >= star) ? 'var(--accent)' : 'var(--border)',fill:(userRating >= star || avgRating >= star) ? 'var(--accent)' : 'transparent'}} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </article>

      {relatedResources.length > 0 && (
        <section className="page-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Related material</span>
              <h2>More from Class {resource.class_level} {resource.subject}</h2>
            </div>
          </div>
          <div className="resource-grid">{relatedResources.slice(0,3).map(res => <ResourceCard key={res.id} resource={res} />)}</div>
        </section>
      )}
    </div>
  );
}
