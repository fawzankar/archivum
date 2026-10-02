'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Resource } from '@/lib/resources';
import { X, Download, FileText, Maximize2, Minimize2, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { resource: Resource | null; onClose: () => void; }

function PdfPage({
  pdf,
  pageNumber,
  scale,
  eager = false,
  zoomed = false,
}: {
  pdf: any;
  pageNumber: number;
  scale: number;
  eager?: boolean;
  zoomed?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // PDF pages are rendered eagerly so a document is immediately available while scrolling.
  const [visible] = useState(true);
  const [rendered, setRendered] = useState(false);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!visible || !pdf || !canvasRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.ceil(viewport.width * dpr);
        canvas.height = Math.ceil(viewport.height * dpr);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        renderTaskRef.current?.cancel?.();
        renderTaskRef.current = page.render({
          canvasContext: context,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
          intent: 'display',
        });

        await renderTaskRef.current.promise;
        if (!cancelled) setRendered(true);
      } catch (error: any) {
        if (!cancelled && error?.name !== 'RenderingCancelledException') {
          setRendered(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel?.();
    };
  }, [pdf, pageNumber, scale, visible]);

  return (
    <div ref={hostRef} className={`pdf-js-page${zoomed ? ' is-zoomed' : ''}`} aria-label={`Page ${pageNumber}`}>
      {!rendered && <div className="pdf-js-page-placeholder"><span>Page {pageNumber}</span></div>}
      <canvas ref={canvasRef} className={rendered ? 'is-rendered' : ''} />
    </div>
  );
}

export default function PdfViewerModal({ resource, onClose }: Props) {
  const [pdf, setPdf] = useState<any>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const pinchRef = useRef<{ startDistance: number; startScale: number } | null>(null);
  const [pinchScale, setPinchScale] = useState<number | null>(null);

  const fileUrl = resource ? `/api/resources/${resource.id}/file` : '';
  const isImage = Boolean(resource && (resource.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(resource.file_name || '')));

  useEffect(() => {
    if (!resource || isImage) return;

    let cancelled = false;
    setLoading(true);
    setLoadProgress(0);
    setFailed(false);
    setPdf(null);
    setPageCount(0);

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const task = pdfjs.getDocument({
          url: fileUrl,
          // Smaller chunks feel much faster on mobile networks while retaining
          // HTTP range loading for large handwritten PDFs.
          rangeChunkSize: 512 * 1024,
          disableAutoFetch: false,
          disableStream: false,
        });
        (task as any).onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (total > 0) setLoadProgress(Math.max(1, Math.min(99, Math.round((loaded / total) * 100))));
        };

        const document = await task.promise;
        if (cancelled) {
          await document.destroy();
          return;
        }
        setPdf(document);
        setPageCount(document.numPages);
        setLoadProgress(100);
        setLoading(false);
      } catch (error) {
        console.error('[pdf-reader]', error);
        if (!cancelled) {
          setLoading(false);
          setFailed(true);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [resource?.id, fileUrl, isImage]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || isImage) return;

    const distance = (a: Touch, b: Touch) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return;
      const startDistance = distance(event.touches[0], event.touches[1]);
      if (!startDistance) return;
      pinchRef.current = { startDistance, startScale: scale };
      setPinchScale(scale);
    };

    const onTouchMove = (event: TouchEvent) => {
      const pinch = pinchRef.current;
      if (!pinch || event.touches.length !== 2) return;
      // Take ownership only while two fingers are down. One-finger scrolling remains native.
      event.preventDefault();
      const currentDistance = distance(event.touches[0], event.touches[1]);
      if (!currentDistance) return;
      const next = Math.max(0.75, Math.min(4, pinch.startScale * (currentDistance / pinch.startDistance)));
      setPinchScale(next);
    };

    const finishPinch = () => {
      const preview = pinchRef.current;
      if (!preview) return;
      pinchRef.current = null;
      setPinchScale(current => {
        const next = current == null ? scale : Math.round(current * 100) / 100;
        setScale(Math.max(0.75, Math.min(4, next)));
        return null;
      });
    };

    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: false });
    stage.addEventListener('touchend', finishPinch, { passive: true });
    stage.addEventListener('touchcancel', finishPinch, { passive: true });
    return () => {
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', finishPinch);
      stage.removeEventListener('touchcancel', finishPinch);
    };
  }, [isImage, scale]);

  useEffect(() => {
    if (!resource) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreen);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.fullscreenElement) onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('keydown', onKey);
    };
  }, [resource, onClose]);

  useEffect(() => {
    if (!resource) return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!meta) return;
    const original = meta.getAttribute('content') || '';
    const allowZoom = () => {
      meta.setAttribute('content', original.replace(/maximum-scale=[^,]+/i, 'maximum-scale=5').replace(/user-scalable=[^,]+/i, 'user-scalable=yes'));
    };
    const restore = () => meta.setAttribute('content', original);
    const onFullscreen = () => document.fullscreenElement ? allowZoom() : restore();
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => { document.removeEventListener('fullscreenchange', onFullscreen); restore(); };
  }, [resource]);

  useEffect(() => {
    return () => { pdf?.destroy?.().catch?.(() => {}); };
  }, [pdf]);

  if (!resource) return null;

  const toggleFullscreen = async () => {
    const target = shellRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (target.requestFullscreen) await target.requestFullscreen();
    } catch {}
  };

  return (
    <div ref={shellRef} className="pdf-reader-shell" role="dialog" aria-modal="true" aria-label={`Reading ${resource.title}`}>
      <section className="pdf-reader-window">
        <header className="pdf-reader-header">
          <div className="pdf-reader-title">
            <div className="pdf-reader-file-icon"><FileText /></div>
            <div className="min-w-0">
              <strong>{resource.title}</strong>
              <span>Class {resource.class_level} · {resource.subject}{pageCount ? ` · ${pageCount} pages` : ''}</span>
            </div>
          </div>

          <div className="pdf-reader-actions">
            <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {fullscreen ? <Minimize2 /> : <Maximize2 />}
            </button>
            <a href={fileUrl} download={resource.file_name || resource.title} aria-label="Download">
              <Download />
            </a>
            <button type="button" onClick={onClose} aria-label="Close reader"><X /></button>
          </div>
        </header>

        <main ref={stageRef} className="pdf-reader-stage">
          {isImage ? (
            <div className="pdf-reader-image"><img src={fileUrl} alt={resource.title} /></div>
          ) : failed ? (
            <div className="pdf-reader-error">
              <AlertTriangle />
              <strong>Couldn’t open this document.</strong>
              <span>Please try again.</span>
              <button type="button" onClick={() => window.location.reload()}><RefreshCw /> Try again</button>
            </div>
          ) : loading ? (
            <div className="pdf-reader-loading">
              <div className="pdf-load-progress" role="progressbar"
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={loadProgress}
                aria-label={`Opening note ${loadProgress}%`}>
                <div className="pdf-load-progress-bar" style={{ width: `${Math.max(4, loadProgress)}%` }} />
              </div>
              <strong>{loadProgress > 0 ? `Opening note · ${loadProgress}%` : 'Opening note…'}</strong>
              <span>Preparing the first pages inside Archivum.</span>
            </div>
          ) : (
            <div
              className="pdf-reader-pages"
              style={{ zoom: (pinchScale ?? scale) } as React.CSSProperties}
            >
              {Array.from({ length: pageCount }, (_, index) => (
                <PdfPage
                  key={index + 1}
                  pdf={pdf}
                  pageNumber={index + 1}
                  scale={1}
                  eager={index < 2}
                />
              ))}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
