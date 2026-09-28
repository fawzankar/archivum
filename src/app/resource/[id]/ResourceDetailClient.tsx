'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource, addRecentlyViewed } from '@/lib/savedStorage';
import ResourceCard from '@/components/ResourceCard';
import { useToast } from '@/components/ToastContext';
import { FileText, Download, Eye, Bookmark, BookmarkCheck, Check, Star, Share2, ArrowLeft, ExternalLink } from 'lucide-react';

interface ResourceDetailProps { resource: Resource; relatedResources: Resource[]; }

export default function ResourceDetailClient({ resource, relatedResources }: ResourceDetailProps) {
  const [saved, setSaved] = useState(() => isResourceSaved(resource.id));
  const [downloads, setDownloads] = useState(resource.downloads);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(resource.average_rating);
  const [ratingCount, setRatingCount] = useState(resource.rating_count);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { addRecentlyViewed(resource); }, [resource]);

  const handleSaveToggle = () => {
    const next = toggleSaveResource(resource);
    setSaved(next);
    showToast(next ? 'Saved to library' : 'Removed from saved', next ? 'success' : 'info');
  };

  const handleDownload = async () => {
    let downloadUrl = `/api/resources/${resource.id}/file`;
    try {
      let sessionId = localStorage.getItem('sjs_session_id');
      if (!sessionId) { sessionId = `session_${crypto.randomUUID()}`; localStorage.setItem('sjs_session_id', sessionId); }
      const response = await fetch(`/api/download/${resource.id}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({sessionId}) });
      const result = await response.json().catch(() => ({}));
      downloadUrl = result.download_url || downloadUrl;
      if (!response.ok || !result.success) throw new Error(result.error || 'Download could not be started');
      setDownloads(result.downloads ?? resource.downloads);
      const link = document.createElement('a'); link.href = downloadUrl; link.download = resource.file_name || resource.title; document.body.appendChild(link); link.click(); link.remove();
      showToast('Downloading document…');
    } catch { window.open(downloadUrl, '_blank'); }
  };

  const handleRating = async (rating: number) => {
    if (ratingSubmitted || ratingSaving) return;
    setRatingSaving(true); setUserRating(rating);
    const previousCount = ratingCount; const previousAverage = avgRating;
    const nextCount = previousCount + 1;
    setRatingCount(nextCount); setAvgRating(previousCount ? ((previousAverage * previousCount) + rating) / nextCount : rating);
    try {
      let sessionId = localStorage.getItem('sjs_session_id');
      if (!sessionId) { sessionId = `session_${crypto.randomUUID()}`; localStorage.setItem('sjs_session_id', sessionId); }
      const res = await fetch('/api/rate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({resourceId:resource.id,rating,sessionId}) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not record rating');
      setAvgRating(json.average_rating); setRatingCount(json.rating_count); setRatingSubmitted(true); showToast('Rating saved', 'success');
    } catch {
      setUserRating(0); setAvgRating(previousAverage); setRatingCount(previousCount); showToast('Could not record rating', 'error');
    } finally { setRatingSaving(false); }
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title:resource.title, text:`Check out ${resource.title} on ARCHIVUM`, url:window.location.href }).catch(() => {});
    else navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied to clipboard'));
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'PDF document';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
  };

  const details: [string, string][] = [
    ['Academic board', resource.board || 'JKBOSE'],
    ['Resource type', resource.resource_type || 'Notes'],
    ['Subject', resource.subject],
    ['Chapter / topic', resource.chapter || resource.topic || 'General syllabus'],
    ['Exam / year', resource.year ? `${resource.paper_type ? `${resource.paper_type} · ` : ''}${resource.year}` : '—'],
    ['Institution / source', resource.school_name || resource.contributor_name || 'ARCHIVUM contributor'],
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-9 space-y-8">
      <Link href={`/notes?class=${resource.class_level}&subject=${encodeURIComponent(resource.subject)}`} className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{color:'var(--ink-muted)'}}><ArrowLeft className="w-3.5 h-3.5" /> Back to {resource.subject} notes</Link>

      <article className="border overflow-hidden" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
        <header className="resource-detail-hero relative p-6 sm:p-9" style={{background:'var(--accent-light)'}}>
          <div className="absolute right-4 top-4 flex gap-2">
            <button onClick={handleShare} className="resource-detail-icon" aria-label="Share resource"><Share2 /></button>
            <button onClick={handleSaveToggle} className={`resource-detail-icon ${saved?'is-saved':''}`} aria-label={saved?'Remove from saved':'Save resource'}>{saved?<BookmarkCheck />:<Bookmark />}</button>
          </div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[.16em] font-bold" style={{color:'var(--accent)'}}><span>Class {resource.class_level}</span><span>·</span><span>{resource.subject}</span><span>·</span><span>{resource.resource_type || 'Notes'}</span></div>
          <div className="mt-6 w-12 h-12 grid place-items-center border" style={{background:'var(--surface)',borderColor:'var(--border)',color:'var(--accent)'}}><FileText className="w-6 h-6" /></div>
          <h1 className="font-display mt-5 max-w-3xl text-3xl sm:text-5xl leading-[.98]" style={{color:'var(--ink)'}}>{resource.title}</h1>
          <div className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-semibold" style={{color:'var(--accent)'}}><Check className="w-3.5 h-3.5" /> Reviewed for the archive</div>
        </header>

        <div className="p-5 sm:p-8 space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b" style={{borderColor:'var(--border-light)'}}>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleDownload} className="resource-primary-action"><Download /> Download</button>
              <a href={`/api/resources/${resource.id}/file`} target="_blank" rel="noopener noreferrer" className="resource-secondary-action"><Eye /> Read online</a>
            </div>
            <div className="flex items-center gap-4 text-[10px]" style={{color:'var(--ink-muted)'}}><span>{downloads} downloads</span><span>{resource.views} views</span><span>{formatFileSize(resource.file_size)}</span></div>
          </div>

          {resource.description && <section><span className="detail-kicker">About this document</span><p className="mt-2 max-w-3xl text-sm leading-7" style={{color:'var(--ink-muted)'}}>{resource.description}</p></section>}

          <section>
            <div className="flex items-end justify-between gap-4"><div><span className="detail-kicker">Academic record</span><h2 className="font-display text-2xl mt-1">Everything attached to this file.</h2></div><ExternalLink className="hidden sm:block w-5 h-5" style={{color:'var(--ink-faint)'}} /></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px border mt-4" style={{borderColor:'var(--border)',background:'var(--border)'}}>{details.map(([label,value]) => <div key={label} className="p-4 sm:p-5" style={{background:'var(--surface)'}}><span className="block text-[9px] uppercase tracking-[.14em] font-bold" style={{color:'var(--ink-faint)'}}>{label}</span><span className="block mt-1.5 text-xs sm:text-sm font-semibold leading-snug" style={{color:'var(--ink)'}}>{value}</span></div>)}</div>
          </section>

          <section className="grid sm:grid-cols-3 gap-px border" style={{borderColor:'var(--border)',background:'var(--border)'}}>
            <div className="p-4" style={{background:'var(--surface)'}}><span className="detail-kicker">Views</span><strong className="block mt-1 text-lg">{resource.views}</strong></div>
            <div className="p-4" style={{background:'var(--surface)'}}><span className="detail-kicker">Downloads</span><strong className="block mt-1 text-lg">{downloads}</strong></div>
            <div className="p-4" style={{background:'var(--surface)'}}><span className="detail-kicker">Rating</span><strong className="flex items-center gap-1 mt-1 text-lg"><Star className="w-4 h-4" style={{color:'var(--accent)',fill:'var(--accent)'}} /> {ratingCount ? avgRating.toFixed(1) : '—'} <span className="text-[10px] font-normal" style={{color:'var(--ink-faint)'}}>{ratingCount ? `(${ratingCount})` : 'No ratings'}</span></strong></div>
          </section>

          <section className="pt-5 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{borderColor:'var(--border-light)'}}>
            <div><span className="detail-kicker">Community signal</span><h3 className="font-display text-xl mt-1">Was this useful?</h3><p className="text-[10px] mt-1" style={{color:'var(--ink-muted)'}}>One rating helps other students judge whether to open it.</p></div>
            <div className="flex items-center gap-1">{[1,2,3,4,5].map(star => <button key={star} onClick={() => handleRating(star)} className="p-1 hover:scale-110 transition-transform" title={`Rate ${star} star`}><Star className="w-5 h-5" style={{color:(userRating>=star || avgRating>=star)?'var(--accent)':'var(--border)',fill:(userRating>=star || avgRating>=star)?'var(--accent)':'transparent'}} /></button>)}</div>
          </section>
        </div>
      </article>

      {relatedResources.length > 0 && <section className="space-y-5"><div><span className="detail-kicker">Related material</span><h2 className="font-display text-3xl mt-1">More for Class {resource.class_level} {resource.subject}</h2></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{relatedResources.slice(0,3).map(res => <ResourceCard key={res.id} resource={res} />)}</div></section>}
    </div>
  );
}
