'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource, addRecentlyViewed } from '@/lib/savedStorage';
import { recordOpen } from '@/lib/studyStats';
import ResourceCard from '@/components/ResourceCard';
import PdfViewerModal from '@/components/PdfViewerModal';
import Art from '@/components/Art';
import { useToast } from '@/components/ToastContext';
import { FileText, Download, Eye, Bookmark, BookmarkCheck, Star, Share2, ArrowLeft, ExternalLink, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ResourceDetailProps { resource: Resource; relatedResources: Resource[]; }

export default function ResourceDetailClient({ resource, relatedResources }: ResourceDetailProps) {
  const [saved, setSaved] = useState(() => isResourceSaved(resource.id));
  const [downloads, setDownloads] = useState(resource.downloads);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(resource.average_rating);
  const [ratingCount, setRatingCount] = useState(resource.rating_count);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [readerOpen, setReaderOpen] = useState(false);
  const { showToast } = useToast();
  const isPaper = resource.resource_type === 'Previous Year Paper' || Boolean(resource.paper_type);
  const backHref = isPaper ? `/previous-papers?class=${resource.class_level}` : `/notes?class=${resource.class_level}&subject=${encodeURIComponent(resource.subject)}`;
  const artName = isPaper ? 'papers' : resource.subject;

  useEffect(() => { addRecentlyViewed(resource); recordOpen(resource.id); }, [resource]);
  useEffect(() => {
    if (!resource.photo_keys) return;
    fetch(`/api/resources/${resource.id}/photos`).then(r => r.json()).then(data => setPhotoUrls(Array.isArray(data.photos) ? data.photos.map((p: {url:string}) => p.url) : [])).catch(() => {});
  }, [resource.id, resource.photo_keys]);

  useEffect(() => {
    try {
      let sessionId = localStorage.getItem('sjs_session_id');
      if (!sessionId) {
        sessionId = `session_${crypto.randomUUID()}`;
        localStorage.setItem('sjs_session_id', sessionId);
      }

      fetch(`/api/rate?resourceId=${resource.id}&sessionId=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => {
          const count = Number(data?.rating_count ?? 0);
          const average = Number(data?.average_rating ?? 0);
          setRatingCount(Number.isFinite(count) ? count : 0);
          setAvgRating(Number.isFinite(average) ? average : 0);

          const own = Number(data?.user_rating ?? 0);
          if (own >= 1 && own <= 5) {
            setUserRating(own);
            setRatingSubmitted(true);
          } else {
            setUserRating(0);
            setRatingSubmitted(false);
          }
        })
        .catch(() => {});
    } catch {}
  }, [resource.id]);

  const handleSaveToggle = () => { const next = toggleSaveResource(resource); setSaved(next); showToast(next ? 'Saved. Find it under Saved anytime.' : 'Removed from your saved list', next ? 'success' : 'info'); };
  const handleDownload = async () => {
    let downloadUrl = `/api/resources/${resource.id}/file`;
    try {
      let sessionId = localStorage.getItem('sjs_session_id');
      if (!sessionId) { sessionId = `session_${crypto.randomUUID()}`; localStorage.setItem('sjs_session_id', sessionId); }
      const response = await fetch(`/api/download/${resource.id}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({sessionId}) });
      const result = await response.json().catch(() => ({})); downloadUrl = result.download_url || downloadUrl;
      if (!response.ok || !result.success) throw new Error(result.error || 'Couldn’t start the download. Try again.');
      setDownloads(result.downloads ?? resource.downloads);
      const link = document.createElement('a'); link.href = downloadUrl; link.download = resource.file_name || resource.title; document.body.appendChild(link); link.click(); link.remove(); showToast('Your download is starting…');
    } catch { window.open(downloadUrl, '_blank'); }
  };
  const handleRating = async (rating: number) => {
    if (ratingSaving) return;
    setRatingSaving(true);
    const previousUserRating = userRating;
    const previousCount = ratingCount;
    const previousAverage = avgRating;

    // Show the user's selection immediately; the aggregate is updated only
    // after the server confirms the database write.
    setUserRating(rating);

    try {
      let sessionId = localStorage.getItem('sjs_session_id');
      if (!sessionId) {
        sessionId = `session_${crypto.randomUUID()}`;
        localStorage.setItem('sjs_session_id', sessionId);
      }

      const res = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ resourceId: resource.id, rating, sessionId }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || 'Could not record rating');
      }

      setAvgRating(Number(json.average_rating ?? 0));
      setRatingCount(Number(json.rating_count ?? 0));
      setRatingSubmitted(true);
      showToast('Thanks for rating!', 'success');
    } catch {
      setUserRating(previousUserRating);
      setAvgRating(previousAverage);
      setRatingCount(previousCount);
      showToast('That rating didn’t go through. Give it another try.', 'error');
    } finally {
      setRatingSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title:resource.title, text:`Check out ${resource.title} on ARCHIVUM`, url:window.location.href }).catch(() => {});
    else navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied. Go share it!'));
  };
  const formatFileSize = (bytes: number) => { if (!bytes) return 'PDF'; const mb=bytes/(1024*1024); return mb>=1?`${mb.toFixed(1)} MB`:`${Math.round(bytes/1024)} KB`; };
  const details: [string,string][] = [
    ['Board', resource.board || 'JKBOSE'], ['Type', resource.resource_type || 'Notes'], ['Subject', resource.subject],
    ['Chapter and topic', resource.chapter || resource.topic || 'Whole syllabus'], ['Exam and year', resource.year ? `${resource.paper_type ? `${resource.paper_type} | ` : ''}${resource.year}` : ''],
    ['Shared by', resource.school_name || resource.contributor_name || 'An ARCHIVUM contributor'],
  ];

  return <main className="resource-modern-page">
    <div className="resource-modern-shell">
      <Link href={backHref} className="resource-back"><ArrowLeft /> Back to {isPaper ? 'Previous Papers' : `${resource.subject} notes`}</Link>

      <article className="resource-modern-card">
        <header className="resource-modern-hero">
          <div className="resource-modern-hero-copy">
            <div className="resource-modern-kicker"><span>CLASS {resource.class_level}</span><i/> <span>{resource.subject}</span><i/> <span>{isPaper ? 'PAPER' : 'NOTES'}</span></div>
            <div className="resource-modern-art"><Art name={artName} /></div>
            <h1>{resource.title}</h1>
            <p>{resource.description || `${isPaper ? 'A question paper' : 'A study resource'} for Class ${resource.class_level} ${resource.subject}.`}</p>
            <div className="resource-modern-actions">
              <button onClick={handleDownload} className="resource-primary-action"><Download /> Download</button>
              <button type="button" onClick={() => setReaderOpen(true)} className="resource-secondary-action"><Eye /> Read Online</button>
              <button onClick={handleSaveToggle} className={`resource-icon-action ${saved ? 'is-saved' : ''}`} aria-label={saved?'Remove from saved':'Save resource'}>{saved?<BookmarkCheck/>:<Bookmark/>}</button>
              <button onClick={handleShare} className="resource-icon-action" aria-label="Share resource"><Share2 /></button>
            </div>
          </div>
        </header>

        <section className="resource-modern-stats">
          <div><span>Views</span><strong>{resource.views}</strong></div><div><span>Downloads</span><strong>{downloads}</strong></div><div><span>File</span><strong>{formatFileSize(resource.file_size)}</strong></div><div><span>Rating</span><strong>{ratingCount ? `${avgRating.toFixed(1)} / 5` : 'New'}</strong></div>
        </section>

        <div className="resource-modern-content">
          <section className="resource-modern-section">
            <div className="resource-section-heading"><span>ABOUT THIS FILE</span><Sparkles /></div>
            <h2>A quick look before you open it.</h2>
            <div className="resource-detail-grid">{details.map(([label,value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          </section>

          {photoUrls.length > 0 && <section className="resource-modern-section"><div className="resource-section-heading"><span>EXTRA PHOTOS</span><ImageIcon /></div><h2>Photos shared with this file.</h2><div className="resource-photo-grid">{photoUrls.map((url,i)=><a key={url} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={`Supporting page ${i+1}`} loading="lazy" /></a>)}</div></section>}

          <section className="resource-modern-rating">
  <div>
    <span>YOUR RATING</span><h2>Was this useful?</h2>
    <p>Tap the stars to rate it. Your stars only show your own rating, not everyone else’s.</p>
    {ratingCount > 0 && <div className="community-rating-summary"><strong>{avgRating.toFixed(1)} / 5</strong><span>from {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}</span></div>}
  </div>
  <div className="resource-rating-control">
    <div className="resource-stars">{[1,2,3,4,5].map(star => {
      const selected = userRating >= star;
      return <button key={star} onClick={() => handleRating(star)} aria-label={`Rate ${star} stars`} disabled={ratingSaving}>
        <Star className={selected ? 'is-selected' : ''}/>
      </button>;
    })}</div>
    {ratingSaving && <span className="rating-saving">Saving…</span>}
    {ratingSubmitted && <span className="rating-saved">Got it, thanks! You can tap the stars again to change it.</span>}
  </div>
</section>
        </div>
      </article>

      {relatedResources.length > 0 && <section className="resource-related"><div><span>KEEP GOING</span><h2>More Class {resource.class_level} {resource.subject}</h2></div><div className="resource-related-grid">{relatedResources.slice(0,3).map(res => <ResourceCard key={res.id} resource={res} />)}</div></section>}
    </div>
    <PdfViewerModal resource={readerOpen ? resource : null} onClose={() => setReaderOpen(false)} />
  </main>;
}
