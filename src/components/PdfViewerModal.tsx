'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Resource } from '@/lib/resources';
import {
  X, ExternalLink, Download, FileText, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Loader2, AlertTriangle
} from 'lucide-react';

interface PdfViewerModalProps {
  resource: Resource | null;
  onClose: () => void;
}

type PdfPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: unknown; intent?: string }) => { promise: Promise<unknown>; cancel?: () => void };
};

type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
  destroy: () => Promise<void>;
};

type PdfJs = {
  getDocument: (options: { url: string; disableWorker: boolean; rangeChunkSize: number }) => { promise: Promise<PdfDocument> };
};

export default function PdfViewerModal({ resource, onClose }: PdfViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rendered, setRendered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<PdfDocument | null>(null);
  const renderTaskRef = useRef<{ cancel?: () => void } | null>(null);

  const fileUrl = resource ? `/api/resources/${resource.id}/file` : '';
  const isImage = Boolean(resource && (resource.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(resource.file_name || '')));

  useEffect(() => {
    if (!resource || isImage) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setRendered(false);
    setPage(1);
    setPageCount(0);
    setZoom(1);
    documentRef.current?.destroy().catch(() => undefined);
    documentRef.current = null;

    import('pdfjs-dist/legacy/build/pdf.mjs')
      .then(async (module) => {
        if (cancelled) return;
        const pdfjs = module as unknown as PdfJs;
        const document = await pdfjs.getDocument({ url: fileUrl, disableWorker: true, rangeChunkSize: 262144 }).promise;
        if (cancelled) {
          await document.destroy().catch(() => undefined);
          return;
        }
        documentRef.current = document;
        setPageCount(document.numPages);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel?.();
      renderTaskRef.current = null;
      documentRef.current?.destroy().catch(() => undefined);
      documentRef.current = null;
    };
  }, [resource?.id, fileUrl, isImage]);

  useEffect(() => {
    if (!resource) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (!isImage && event.key === 'ArrowLeft') setPage(value => Math.max(1, value - 1));
      if (!isImage && event.key === 'ArrowRight') setPage(value => Math.min(pageCount || value + 1, value + 1));
      if (!isImage && (event.ctrlKey || event.metaKey) && event.key === '+') {
        event.preventDefault();
        setZoom(value => Math.min(2, value + 0.1));
      }
      if (!isImage && (event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        setZoom(value => Math.max(0.7, value - 0.1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resource, onClose, isImage, pageCount]);

  useEffect(() => {
    if (isImage || !documentRef.current || !canvasRef.current || !stageRef.current) return;
    let cancelled = false;
    const render = async () => {
      const document = documentRef.current;
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!document || !canvas || !stage) return;
      renderTaskRef.current?.cancel?.();
      const pdfPage = await document.getPage(page);
      if (cancelled) return;
      const baseViewport = pdfPage.getViewport({ scale: 1 });
      const availableWidth = Math.max(320, stage.clientWidth - 42);
      const fitScale = Math.min(1.8, availableWidth / baseViewport.width);
      const scale = Math.max(0.55, fitScale * zoom);
      const viewport = pdfPage.getViewport({ scale });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('Canvas unavailable');
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, viewport.width, viewport.height);
      const task = pdfPage.render({ canvasContext: context, viewport, intent: 'display' });
      renderTaskRef.current = task;
      await task.promise;
      if (!cancelled) setRendered(true);
    };
    render().catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => { cancelled = true; renderTaskRef.current?.cancel?.(); };
  }, [page, zoom, isImage, pageCount]);

  if (!resource) return null;

  const changeZoom = (delta: number) => setZoom(value => Math.min(2, Math.max(0.7, value + delta)));
  const openOriginal = () => window.open(fileUrl, '_blank', 'noopener,noreferrer');

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
              <button type="button" onClick={() => changeZoom(-0.1)} aria-label="Zoom out"><ZoomOut /></button>
              <span className="pdf-reader-zoom">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => changeZoom(0.1)} aria-label="Zoom in"><ZoomIn /></button>
              <button type="button" onClick={() => { setPage(1); setZoom(1); }} aria-label="Reset view"><RotateCcw /></button>
              <button type="button" onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page <= 1} aria-label="Previous page"><ChevronLeft /></button>
              <div className="pdf-reader-page"><strong>{page}</strong><span>/ {pageCount || '—'}</span></div>
              <button type="button" onClick={() => setPage(value => Math.min(pageCount || value + 1, value + 1))} disabled={pageCount > 0 && page >= pageCount} aria-label="Next page"><ChevronRight /></button>
            </>}
            <button type="button" onClick={openOriginal} aria-label="Open in new tab"><ExternalLink /></button>
            <a href={fileUrl} download={resource.file_name || resource.title} aria-label="Download"><Download /></a>
            <button type="button" onClick={onClose} aria-label="Close reader"><X /></button>
          </div>
        </header>

        <div className="pdf-reader-stage" ref={stageRef}>
          {isImage ? (
            <div className="pdf-reader-image-wrap"><img src={fileUrl} alt={resource.title} onLoad={() => setLoading(false)} onError={() => { setLoading(false); setFailed(true); }} /></div>
          ) : (
            <div className="pdf-reader-canvas-wrap">
              <canvas ref={canvasRef} aria-label={`Page ${page} of ${pageCount || 'document'}`} />
            </div>
          )}

          {loading && !failed && (
            <div className="pdf-reader-loading">
              <div className="pdf-reader-loading-card">
                <Loader2 className="animate-spin" />
                <strong>Opening document</strong>
                <span>Loading the first page…</span>
              </div>
            </div>
          )}

          {failed && (
            <div className="pdf-reader-error">
              <div className="pdf-reader-error-card">
                <div className="pdf-reader-error-icon"><AlertTriangle /></div>
                <h3>We couldn't render this document here.</h3>
                <p>The original file is still available. Open it in a new tab or download it.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                  <button className="pdf-reader-primary" type="button" onClick={openOriginal}><ExternalLink /> Open document</button>
                  <a className="pdf-reader-secondary" href={fileUrl} download={resource.file_name || resource.title}><Download /> Download</a>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="pdf-reader-footer">
          <span>{rendered ? 'Ready to read' : 'PDF reader'}</span>
          <span>{resource.file_name || 'document.pdf'}</span>
          <button type="button" onClick={() => stageRef.current?.requestFullscreen?.()} aria-label="Fullscreen"><Maximize2 /></button>
        </footer>
      </section>
    </div>
  );
}
