'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { getSavedResourcesList, getRecentlyViewed } from '@/lib/savedStorage';
import ResourceCard from '@/components/ResourceCard';
import PdfViewerModal from '@/components/PdfViewerModal';
import { Bookmark, Clock, ArrowRight } from 'lucide-react';

export default function SavedClient() {
  const [savedItems, setSavedItems] = useState<Resource[]>([]);
  const [recentItems, setRecentItems] = useState<Resource[]>([]);
  const [activePdf, setActivePdf] = useState<Resource | null>(null);

  useEffect(() => {
    setSavedItems(getSavedResourcesList());
    setRecentItems(getRecentlyViewed());

    const handleUpdate = () => {
      setSavedItems(getSavedResourcesList());
      setRecentItems(getRecentlyViewed());
    };

    window.addEventListener('sjs_saved_updated', handleUpdate);
    return () => window.removeEventListener('sjs_saved_updated', handleUpdate);
  }, []);

  return (
    <div className="space-y-12">
      
      
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-rose-600" />
            <span>Bookmarked ({savedItems.length})</span>
          </h2>
        </div>

        {savedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItems.map((r) => (
              <ResourceCard key={r.id} resource={r} onView={(res) => setActivePdf(res)} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-16 rounded-3xl border space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <Bookmark className="w-10 h-10 mx-auto" style={{ color: 'var(--ink-faint)' }} />
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
                Your saved collection is empty
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Tap the bookmark icon on any note or paper card to save it for quick offline revision.
              </p>
            </div>
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <span>Explore Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      
      {recentItems.length > 0 && (
        <section className="space-y-5 pt-8 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <h2 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span>Recently Viewed</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((r) => (
              <ResourceCard key={r.id} resource={r} onView={(res) => setActivePdf(res)} compact />
            ))}
          </div>
        </section>
      )}

      
      <PdfViewerModal resource={activePdf} onClose={() => setActivePdf(null)} />
    </div>
  );
}
