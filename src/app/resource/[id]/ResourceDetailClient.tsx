'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource, addRecentlyViewed } from '@/lib/savedStorage';
import ResourceCard from '@/components/ResourceCard';
import { useToast } from '@/components/ToastContext';
import { 
  FileText, 
  Download, 
  Eye, 
  Bookmark, 
  BookmarkCheck, 
  Check, 
  Star, 
  Share2, 
  ArrowLeft,
} from 'lucide-react';

interface ResourceDetailProps {
  resource: Resource;
  relatedResources: Resource[];
}

const PASTEL_THEMES = [
  { bg: '#F5D6CE', iconColor: '#B85D4F' },
  { bg: '#D8E6EC', iconColor: '#4A7688' },
  { bg: '#E2DCED', iconColor: '#6B5A96' },
  { bg: '#F4ECC8', iconColor: '#96843C' },
  { bg: '#D4E2D0', iconColor: '#4F754A' },
];

export default function ResourceDetailClient({ resource, relatedResources }: ResourceDetailProps) {
  const [saved, setSaved] = useState(() => isResourceSaved(resource.id));
  const [downloads, setDownloads] = useState(resource.downloads);
  const [userRating, setUserRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(resource.average_rating);
  const [ratingCount, setRatingCount] = useState<number>(resource.rating_count);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    addRecentlyViewed(resource);
  }, [resource]);

  const themeIndex = Math.abs(resource.id) % PASTEL_THEMES.length;
  const theme = PASTEL_THEMES[themeIndex];

  const handleSaveToggle = () => {
    const isNowSaved = toggleSaveResource(resource);
    setSaved(isNowSaved);
    showToast(isNowSaved ? 'Saved to library 🔖' : 'Removed from saved', isNowSaved ? 'success' : 'info');
  };

  const handleDownload = async () => {
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
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Download could not be started');
      }

      setDownloads(result.downloads ?? resource.downloads);

      const link = document.createElement('a');
      link.href = resource.file_url;
      link.download = resource.file_name || resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Downloading document... 📥');
    } catch {
      window.open(resource.file_url, '_blank');
    }
  };

  const handleRating = async (rating: number) => {
    if (ratingSubmitted) return;
    setUserRating(rating);
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
      showToast('Thank you for rating! ⭐', 'success');
    } catch {
      setUserRating(0);
      showToast('Could not record rating', 'error');
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      
      {/* Back button */}
      <div>
        <Link
          href="/notes"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </Link>
      </div>

      {/* Hero Showcase Card */}
      <div
        className="rounded-3xl border overflow-hidden shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Pastel Header Banner */}
        <div
          className="p-8 sm:p-12 flex flex-col items-center justify-center text-center relative"
          style={{ backgroundColor: theme.bg }}
        >
          {/* Top Save & Share Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', color: '#4B5563' }}
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveToggle}
              className="p-2 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: saved ? 'var(--rose)' : '#4B5563',
              }}
              title={saved ? 'Remove from saved' : 'Save to library'}
            >
              {saved ? <BookmarkCheck className="w-4 h-4 text-rose-600 fill-rose-600" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
            <FileText className="w-8 h-8" style={{ color: theme.iconColor }} strokeWidth={1.8} />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2">
            <span
              className="px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: theme.iconColor }}
            >
              Class {resource.class_level} · {resource.subject}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Verified
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-zinc-900 max-w-2xl leading-tight">
            {resource.title}
          </h1>
        </div>

        {/* Action Bar & Metadata */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="px-6 py-3 rounded-full font-medium text-xs sm:text-sm text-white bg-zinc-900 hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <a
                href={resource.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-full font-medium text-xs sm:text-sm border transition-colors flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                <Eye className="w-4 h-4" />
                <span>Read Online</span>
              </a>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--ink-muted)' }}>
              <span>{downloads} downloads</span>
              <span>·</span>
              <span>{formatFileSize(resource.file_size)}</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" style={{ color: "var(--accent)", fill: "var(--accent)" }} />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {ratingCount > 0 ? avgRating.toFixed(1) : 'No ratings'}
                </span>
                {ratingCount > 0 && <span>({ratingCount})</span>}
              </div>
            </div>
          </div>

          {/* Description */}
          {resource.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                About this document
              </h3>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-normal">
                {resource.description}
              </p>
            </div>
          )}

          {/* Academic Details Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="p-4 rounded-2xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--surface-raised)' }}>
              <span className="block text-[10px] font-semibold uppercase text-zinc-400">Academic Board</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
                {resource.board || 'JKBOSE'}
              </span>
            </div>

            <div className="p-4 rounded-2xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--surface-raised)' }}>
              <span className="block text-[10px] font-semibold uppercase text-zinc-400">Resource Category</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
                {resource.resource_type}
              </span>
            </div>

            <div className="p-4 rounded-2xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--surface-raised)' }}>
              <span className="block text-[10px] font-semibold uppercase text-zinc-400">Chapter / Topic</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 block truncate">
                {resource.chapter || resource.topic || 'General Syllabus'}
              </span>
            </div>

            <div className="p-4 rounded-2xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--surface-raised)' }}>
              <span className="block text-[10px] font-semibold uppercase text-zinc-400">Institution / Source</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 block truncate">
                {resource.contributor_name || resource.school_name || 'ARCHIVUM Contributor'}
              </span>
            </div>
          </div>

          {/* Rate this Resource Section */}
          <div className="pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border-light)' }}>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Was this resource helpful?
              </h4>
              <p className="text-[11px] text-zinc-500">
                {ratingCount > 0 ? `${avgRating.toFixed(1)} / 5 from ${ratingCount} rating${ratingCount === 1 ? '' : 's'}.` : 'No ratings yet — your rating will be the first.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="p-1 transition-transform hover:scale-125 cursor-pointer"
                  title={`Rate ${star} star`}
                >
                  <Star
                    className="w-5 h-5"
                    style={{
                      color: (userRating >= star || avgRating >= star) ? 'var(--accent)' : 'var(--border)',
                      fill: (userRating >= star || avgRating >= star) ? 'var(--accent)' : 'transparent',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Related Resources (using reference ResourceCards) */}
      {relatedResources.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">
              RELATED MATERIAL
            </span>
            <h2 className="font-display font-bold text-2xl text-zinc-900 dark:text-zinc-100">
              More for Class {resource.class_level} {resource.subject}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedResources.slice(0, 3).map((res) => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
