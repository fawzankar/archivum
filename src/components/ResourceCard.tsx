'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { isResourceSaved, toggleSaveResource } from '@/lib/savedStorage';
import { useToast } from './ToastContext';
import { Bookmark, BookmarkCheck, FileText, Check, Star, ArrowRight } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onView?: (resource: Resource) => void;
  compact?: boolean;
  colorClass?: string;
}

// 5 calibrated theme-adaptive pastel classes from globals.css
const PASTEL_CLASSES = [
  'pastel-block-peach',
  'pastel-block-sky',
  'pastel-block-lavender',
  'pastel-block-yellow',
  'pastel-block-sage',
];

export default function ResourceCard({ resource, onView, compact = false, colorClass }: ResourceCardProps) {
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
    const isNowSaved = toggleSaveResource(resource);
    setSaved(isNowSaved);
    showToast(isNowSaved ? 'Saved to library 🔖' : 'Removed from saved', isNowSaved ? 'success' : 'info');
  };

  const pastelClass = colorClass || PASTEL_CLASSES[Math.abs(resource.id) % PASTEL_CLASSES.length];

  const formatCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md border select-none"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Top Theme-Adaptive Pastel Block with PDF Icon & Save Bookmark */}
      <Link
        href={`/resource/${resource.slug || resource.id}`}
        className={`relative ${compact ? 'h-24' : 'h-28 sm:h-32'} w-full flex flex-col items-center justify-center transition-opacity group-hover:opacity-95 ${pastelClass}`}
        onClick={onView ? (e) => { e.preventDefault(); onView(resource); } : undefined}
      >
        {/* PDF Symbol in center with current color */}
        <div className="flex flex-col items-center justify-center gap-1">
          <FileText
            className="w-7 h-7"
            strokeWidth={1.75}
          />
          <span className="text-[10px] font-bold tracking-wider uppercase">
            PDF
          </span>
        </div>

        {/* Bookmark Icon in top right */}
        <button
          onClick={handleSaveToggle}
          title={saved ? 'Remove from saved' : 'Save resource'}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full transition-transform hover:scale-110 active:scale-95 shadow-sm cursor-pointer"
          style={{
            backgroundColor: 'var(--surface)',
            color: saved ? 'var(--rose)' : 'var(--ink-muted)',
            border: '1px solid var(--border-light)',
          }}
        >
          {saved ? (
            <BookmarkCheck className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
          ) : (
            <Bookmark className="w-3.5 h-3.5" />
          )}
        </button>
      </Link>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-2">
        
        {/* Top meta tags: Type badge + Verified indicator */}
        <div className="flex items-center justify-between text-xs">
          <span
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase border"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface-raised)',
              color: 'var(--ink-muted)',
            }}
          >
            {resource.resource_type || (resource.paper_type ? 'Exam Paper' : 'Notes')}
          </span>

          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: 'var(--sage)' }}
          >
            <Check className="w-3 h-3 stroke-[2.5]" />
            Verified
          </span>
        </div>

        {/* Title in Serif font */}
        <Link
          href={`/resource/${resource.slug || resource.id}`}
          onClick={onView ? (e) => { e.preventDefault(); onView(resource); } : undefined}
          className="block group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors"
        >
          <h3
            className="font-display font-bold text-sm sm:text-base leading-snug line-clamp-2"
            style={{ color: 'var(--ink)' }}
          >
            {resource.title}
          </h3>
        </Link>

        {/* Metadata string */}
        <div
          className="text-[11px] leading-relaxed line-clamp-1 font-medium"
          style={{ color: 'var(--ink-muted)' }}
        >
          Class {resource.class_level} · {resource.subject}
          {resource.chapter ? ` · ${resource.chapter}` : ''}
          {resource.contributor_name ? ` · ${resource.contributor_name}` : resource.school_name ? ` · ${resource.school_name}` : ' · JKBOSE'}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-[4px]" />

        {/* Card Footer: Rating, Downloads & Preview link */}
        <div
          className="pt-3 border-t flex items-center justify-between text-xs"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <div className="flex items-center gap-1.5" style={{ color: 'var(--ink-muted)' }}>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold" style={{ color: 'var(--ink)' }}>
              {resource.average_rating ? resource.average_rating.toFixed(1) : '4.8'}
            </span>
            <span className="text-zinc-400">·</span>
            <span className="font-medium">{formatCount(resource.downloads)}</span>
          </div>

          {onView ? (
            <button
              onClick={() => onView(resource)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold transition-colors hover:underline cursor-pointer"
              style={{ color: 'var(--ink)' }}
            >
              <span>Preview</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <Link
              href={`/resource/${resource.slug || resource.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold transition-colors hover:underline"
              style={{ color: 'var(--ink)' }}
            >
              <span>Preview</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
