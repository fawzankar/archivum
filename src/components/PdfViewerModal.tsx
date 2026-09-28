'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Resource } from '@/lib/resources';
import {
  X, ExternalLink, Download, FileText, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Loader2, AlertTriangle
} from 'lucide-react';

interface PdfViewerModalProps {
  resource: Resource | null;
  onClose: () => void;
}

export default function PdfViewerModal({ resource, onClose }: PdfViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const fileUrl = useMemo(() => resource ? `/api/resources/${resource.id}/file` : '', [resource]);
  const isImage = Boolean(resource && (resource.file_type?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(resource.file_name || '')));

  useEffect(() => {
    if (!resource) return;
    setLoading(true);
    setFailed(false);
    setPage(1);
    setZoom(100);
    const timer = window.setTimeout(() => setFailed(true), 9000);
    return () => window.clearTimeout(timer);
  }, [resource?.id]);

  useEffect(() => {
    if (!resource) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (!isImage && event.key === 'ArrowLeft') setPage(value => Math.max(1, value - 1));
      if (!isImage && event.key === 'ArrowRight') setPage(value => value + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resource, onClose, isImage]);

  if (!resource) return null;

  const frameUrl = isImage ? fileUrl : `${fileUrl}#page=${page}&zoom=${zoom}&toolbar=0&navpanes=0&view=FitH`;

  const changeZoom = (delta: number) => setZoom(value => Math.min(180, Math.max(60, value + delta)));

  return (
    <div className="pdf-reader-shell" role="dialog" aria-modal="true" aria-label={`Reading ${resource.title}`}>
      <div className="pdf-reader-backdrop" onClick={onClose} />
      <section className="pdf-reader-window">
        <header className="pdf-reader-header">
          <div className="min-w-0 flex items-center gap-3">
            <div className="pdf-reader-file-icon"><FileText /></div>
            <div className="min-w-0">
              <strong className="block truncate">{resource.title}</strong>
              <span className="block truncate">Class {resource.class_level} · {resource.subject} · {resource.resource_type || 'Notes'}</span>
            </div>
          </div>
          <div className="pdf-reader-actions">
            {!isImage && <>
              <button type="button" onClick={() => changeZoom(-10)} aria-label="Zoom out"><ZoomOut /></button>
              <span className="pdf-reader-zoom">{zoom}%</span>
              <button type="button" onClick={() => changeZoom(10)} aria-label="Zoom in"><ZoomIn /></button>
              <button type="button" onClick={() => { setPage(1); setZoom(100); }} aria-label="Reset view"><RotateCcw /></button>
              <button type="button" onClick={() => setPage(value => Math.max(1, value - 1))} aria-label="Previous page"><ChevronLeft /></button>
              <div className="pdf-reader-page"><span>Page</span><strong>{page}</strong></div>
              <button type="button" onClick={() => setPage(value => value + 1)} aria-label="Next page"><ChevronRight /></button>
            </>}
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab"><ExternalLink /></a>
            <a href={fileUrl} download={resource.file_name || resource.title} aria-label="Download"><Download /></a>
            <button type="button" onClick={onClose} aria-label="Close reader"><X /></button>
          </div>
        </header>

        <div className="pdf-reader-stage">
          {loading && !failed && (
            <div className="pdf-reader-loading">
              <div className="pdf-reader-loading-card">
                <Loader2 className="animate-spin" />
                <strong>Opening your document…</strong>
                <span>ARCHIVUM is preparing the reading view.</span>
              </div>
            </div>
          )}

          {failed && (
            <div className="pdf-reader-error">
              <div className="pdf-reader-error-card">
                <div className="pdf-reader-error-icon"><AlertTriangle /></div>
                <h3>That document did not render here.</h3>
                <p>The file is still available. Try opening it in a new tab or downloading the original.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                  <a className="pdf-reader-primary" href={fileUrl} target="_blank" rel="noopener noreferrer"><ExternalLink /> Open document</a>
                  <a className="pdf-reader-secondary" href={fileUrl} download={resource.file_name || resource.title}><Download /> Download</a>
                </div>
              </div>
            </div>
          )}

          {!failed && (
            <div className={`pdf-reader-frame ${loading ? 'is-loading' : ''}`}>
              {isImage ? (
                <img src={frameUrl} alt={resource.title} onLoad={() => setLoading(false)} onError={() => setFailed(true)} />
              ) : (
                <iframe
                  key={`${resource.id}-${page}-${zoom}`}
                  src={frameUrl}
                  title={resource.title}
                  onLoad={() => setLoading(false)}
                  onError={() => setFailed(true)}
                />
              )}
            </div>
          )}
        </div>

        <footer className="pdf-reader-footer">
          <span>ESC to close · ← → to move between pages</span>
          <span>{resource.file_name || 'document.pdf'}</span>
        </footer>
      </section>
    </div>
  );
}
