'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { getSavedResourcesList, getRecentlyViewed } from '@/lib/savedStorage';
import ResourceCard from '@/components/ResourceCard';
import PdfViewerModal from '@/components/PdfViewerModal';
import { Bookmark, Clock, ArrowRight, Download, HardDriveDownload } from 'lucide-react';
import { hasOfflinePdf, offlineSupported, saveOfflinePdf } from '@/lib/offlinePdfs';

function resourceFileKey(resource: Resource) {
  return `${resource.id}:${resource.file_hash || `${resource.file_name}:${resource.file_size}:${resource.updated_at}`}`;
}

function isPdf(resource: Resource) {
  return resource.file_type === 'application/pdf' || /\.pdf$/i.test(resource.file_name || resource.file_url || '');
}

export default function SavedClient() {
  const [savedItems, setSavedItems] = useState<Resource[]>([]);
  const [recentItems, setRecentItems] = useState<Resource[]>([]);
  const [activePdf, setActivePdf] = useState<Resource | null>(null);
  const [offlineBusy, setOfflineBusy] = useState(false);
  const [offlineProgress, setOfflineProgress] = useState({ done: 0, total: 0, current: '' });
  const [offlineMessage, setOfflineMessage] = useState('');

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

  const downloadSavedPdfs = async () => {
    const pdfs = savedItems.filter(isPdf);
    if (!offlineSupported() || offlineBusy || !pdfs.length) return;
    setOfflineBusy(true);
    setOfflineMessage('');
    setOfflineProgress({ done: 0, total: pdfs.length, current: '' });
    let downloaded = 0;
    let alreadyOffline = 0;
    const failed: string[] = [];
    try {
      for (const resource of pdfs) {
        const fileKey = resourceFileKey(resource);
        setOfflineProgress((progress) => ({ ...progress, current: resource.title }));
        try {
          if (await hasOfflinePdf(fileKey)) {
            alreadyOffline += 1;
          } else {
            await saveOfflinePdf({
              id: resource.id,
              title: resource.title,
              fileKey,
              url: `/api/resources/${resource.id}/file`,
              pageUrl: `/resource/${resource.slug || resource.id}`,
            });
            downloaded += 1;
          }
        } catch {
          failed.push(resource.title);
        }
        setOfflineProgress((progress) => ({ ...progress, done: progress.done + 1 }));
      }
      const result = `Offline PDFs: ${downloaded} downloaded, ${alreadyOffline} already saved${failed.length ? `, ${failed.length} failed` : ''}.`;
      setOfflineMessage(failed.length ? `${result} Failed: ${failed.slice(0, 3).join(', ')}${failed.length > 3 ? ', …' : ''}` : result);
    } finally {
      setOfflineBusy(false);
      setOfflineProgress((progress) => ({ ...progress, current: '' }));
    }
  };

  const savedPdfCount = savedItems.filter(isPdf).length;

  return (
    <div className="space-y-12">
      
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-rose-600" />
            <span>Bookmarked ({savedItems.length})</span>
          </h2>
          {savedPdfCount > 0 && offlineSupported() && (
            <button type="button" onClick={downloadSavedPdfs} disabled={offlineBusy} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-700 disabled:opacity-60" aria-label="Download all saved PDFs for offline reading">
              {offlineBusy ? <HardDriveDownload className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4" />}
              {offlineBusy ? `Saving ${offlineProgress.done}/${offlineProgress.total}` : 'Download PDFs offline'}
            </button>
          )}
        </div>

        {offlineBusy && <p className="text-xs text-zinc-500" aria-live="polite">Saving {offlineProgress.current} ({offlineProgress.done + 1} of {offlineProgress.total})…</p>}
        {offlineMessage && <p className="text-xs text-zinc-600 dark:text-zinc-300" role="status">{offlineMessage}</p>}

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
              className="saved-explore-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
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
