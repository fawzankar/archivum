'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Resource } from '@/lib/resources';
import { readPdfPage, writePdfPage } from '@/lib/pdfPageCache';
import { X, Download, FileText, Maximize2, Minimize2, AlertTriangle, RefreshCw, Minus, Plus } from 'lucide-react';

interface Props { resource: Resource | null; onClose: () => void; }

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const PAGE_CACHE_DPR = 2;
const MIN_READER_ZOOM = 0.5;
const MAX_READER_ZOOM = 2.5;
const INITIAL_READER_ZOOM = 1;
const READER_ZOOM_STEP = 0.15;

const pdfDocuments = new Map<string, Promise<any>>();

function loadPdfDocument(fileUrl: string, onProgress: (loaded: number, total: number) => void) {
  const existing = pdfDocuments.get(fileUrl);
  if (existing) return existing;
  const pending = import('pdfjs-dist/build/pdf.mjs').then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    const task = pdfjs.getDocument({ url: fileUrl, rangeChunkSize: 512 * 1024, disableAutoFetch: false, disableStream: false });
    (task as any).onProgress = ({ loaded, total }: { loaded: number; total: number }) => onProgress(loaded, total);
    return task.promise;
  });
  pdfDocuments.set(fileUrl, pending);
  pending.catch(() => { if (pdfDocuments.get(fileUrl) === pending) pdfDocuments.delete(fileUrl); });
  return pending;
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9));
}

const PdfPage = React.memo(function PdfPage({ pdf, pageNumber, fileKey, onSettled }: {
  pdf: any; pageNumber: number; fileKey: string;
  onSettled: (pageNumber: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = Math.round(A4_WIDTH * PAGE_CACHE_DPR);
      canvas.height = Math.round(A4_HEIGHT * PAGE_CACHE_DPR);

      try {
        const cacheKey = `${fileKey}:a4-v1:${pageNumber}`;
        const cached = await readPdfPage(cacheKey);
        if (cancelled) return;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('Canvas is not available');
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (cached) {
          const image = await createImageBitmap(cached);
          if (cancelled) { image.close(); return; }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          image.close();
        } else {
          const page = await pdf.getPage(pageNumber);
          if (cancelled) return;
          const baseViewport = page.getViewport({ scale: 1 });
          const contentScale = Math.min(A4_WIDTH / baseViewport.width, A4_HEIGHT / baseViewport.height);
          const viewport = page.getViewport({ scale: contentScale });
          const offsetX = (canvas.width - viewport.width * PAGE_CACHE_DPR) / 2;
          const offsetY = (canvas.height - viewport.height * PAGE_CACHE_DPR) / 2;
          renderTaskRef.current?.cancel?.();
          renderTaskRef.current = page.render({
            canvasContext: context,
            viewport,
            transform: [PAGE_CACHE_DPR, 0, 0, PAGE_CACHE_DPR, offsetX, offsetY],
            intent: 'display',
          });
          await renderTaskRef.current.promise;
          if (cancelled) return;
          const blob = await canvasBlob(canvas);
          if (blob && !cancelled) await writePdfPage(cacheKey, blob);
        }
        if (!cancelled) {
          setRendered(true);
          onSettled(pageNumber);
        }
      } catch (error: any) {
        if (!cancelled && error?.name !== 'RenderingCancelledException') {
          setRendered(false);
          onSettled(pageNumber);
        }
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel?.();
    };
  }, [pdf, pageNumber, fileKey, onSettled]);

  return (
    <div ref={hostRef} className="pdf-js-page" aria-label={`Page ${pageNumber}`}>
      {!rendered && <div className="pdf-js-page-placeholder"><span>Page {pageNumber}</span></div>}
      <canvas ref={canvasRef} className={rendered ? 'is-rendered' : ''} />
    </div>
  );
});

export default function PdfViewerModal({ resource, onClose }: Props) {
  const [pdf, setPdf] = useState<any>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fitScale, setFitScale] = useState(0.7);
  const [fitScaleReady, setFitScaleReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(INITIAL_READER_ZOOM);
  const [settledPages, setSettledPages] = useState<Set<number>>(() => new Set());
  const zoomRef = useRef(INITIAL_READER_ZOOM);
  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);

  const changeZoom = useCallback((value: number) => {
    const bounded = Math.min(MAX_READER_ZOOM, Math.max(MIN_READER_ZOOM, value));
    zoomRef.current = bounded;
    setZoomLevel(bounded);
  }, []);
  const onPageSettled = useCallback((pageNumber: number) => {
    setSettledPages((current) => {
      if (current.has(pageNumber)) return current;
      const next = new Set(current);
      next.add(pageNumber);
      return next;
    });
  }, []);
  const allPagesReady = Boolean(pdf && fitScaleReady && pageCount > 0 && settledPages.size >= pageCount);

  const fileUrl = resource ? `/api/resources/${resource.id}/file` : '';
  const isImage = Boolean(resource && (resource.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(resource.file_name || '')));
  const fileKey = resource ? `${resource.id}:${resource.file_hash || `${resource.file_name}:${resource.file_size}:${resource.updated_at}`}` : '';

  useEffect(() => {
    if (!resource || isImage) return;
    let cancelled = false;
    setLoading(true);
    setLoadProgress(0);
    setFailed(false);
    setPdf(null);
    setPageCount(0);
    setSettledPages(new Set());
    setFitScaleReady(false);
    zoomRef.current = INITIAL_READER_ZOOM;
    setZoomLevel(INITIAL_READER_ZOOM);

    loadPdfDocument(fileUrl, (loaded, total) => {
      if (total > 0 && !cancelled) setLoadProgress(Math.max(1, Math.min(99, Math.round((loaded / total) * 100))));
    }).then((document) => {
      if (cancelled) return;
      setPdf(document);
      setPageCount(document.numPages);
      setLoadProgress(100);
      setLoading(false);
    }).catch((error) => {
      console.error('[pdf-reader]', error);
      if (!cancelled) { setLoading(false); setFailed(true); }
    });

    return () => { cancelled = true; };
  }, [resource?.id, fileUrl, isImage]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || isImage) return;
    let pinchStartDistance = 0;
    let pinchStartZoom = zoomRef.current;
    let gestureEventActive = false;
    let animationFrame = 0;
    let pendingZoom = zoomRef.current;
    let tapStart: { x: number; y: number; at: number; moved: boolean } | null = null;
    let lastTap: { x: number; y: number; at: number } | null = null;
    const distance = (touches: TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    const scheduleZoom = (value: number) => {
      pendingZoom = Math.min(MAX_READER_ZOOM, Math.max(MIN_READER_ZOOM, value));
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => { animationFrame = 0; changeZoom(pendingZoom); });
    };
    const finishPinch = () => {
      pinchStartDistance = 0;
      gestureEventActive = false;
      if (animationFrame) { window.cancelAnimationFrame(animationFrame); animationFrame = 0; }
      changeZoom(pendingZoom);
    };
    const onTouchStart = (event: TouchEvent) => {
      if ((event.target as Element | null)?.closest('button,a')) return;
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        tapStart = { x: touch.clientX, y: touch.clientY, at: performance.now(), moved: false };
      } else if (event.touches.length === 2 && !gestureEventActive) {
        tapStart = null;
        pinchStartDistance = distance(event.touches);
        pinchStartZoom = zoomRef.current;
        pendingZoom = pinchStartZoom;
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && tapStart) {
        const touch = event.touches[0];
        if (Math.hypot(touch.clientX - tapStart.x, touch.clientY - tapStart.y) > 12) tapStart.moved = true;
        return;
      }
      if (gestureEventActive || event.touches.length !== 2 || pinchStartDistance <= 0) return;
      event.preventDefault();
      scheduleZoom(pinchStartZoom * (distance(event.touches) / pinchStartDistance));
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2 && pinchStartDistance > 0) finishPinch();
      if (event.touches.length !== 0 || !tapStart) return;
      const ended = event.changedTouches[0];
      const tap = tapStart;
      tapStart = null;
      if (!ended || tap.moved || performance.now() - tap.at > 360) return;
      if (lastTap && performance.now() - lastTap.at < 340 && Math.hypot(ended.clientX - lastTap.x, ended.clientY - lastTap.y) < 42) {
        changeZoom(zoomRef.current > 1.01 ? 1 : 2);
        lastTap = null;
      } else lastTap = { x: ended.clientX, y: ended.clientY, at: performance.now() };
    };
    const onGestureStart = (event: Event) => {
      gestureEventActive = true;
      pinchStartZoom = zoomRef.current;
      pendingZoom = pinchStartZoom;
      event.preventDefault();
    };
    const onGestureChange = (event: Event) => {
      if (!gestureEventActive) return;
      event.preventDefault();
      const scale = (event as Event & { scale?: number }).scale;
      if (typeof scale === 'number') scheduleZoom(pinchStartZoom * scale);
    };
    const onGestureEnd = (event: Event) => { if (gestureEventActive) { event.preventDefault(); finishPinch(); } };
    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: false });
    stage.addEventListener('touchend', onTouchEnd, { passive: true });
    stage.addEventListener('touchcancel', onTouchEnd, { passive: true });
    stage.addEventListener('gesturestart', onGestureStart, { passive: false });
    stage.addEventListener('gesturechange', onGestureChange, { passive: false });
    stage.addEventListener('gestureend', onGestureEnd, { passive: false });
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', onTouchEnd);
      stage.removeEventListener('touchcancel', onTouchEnd);
      stage.removeEventListener('gesturestart', onGestureStart);
      stage.removeEventListener('gesturechange', onGestureChange);
      stage.removeEventListener('gestureend', onGestureEnd);
    };
  }, [isImage, changeZoom]);

  useLayoutEffect(() => {
    if (!pdf || isImage || !stageRef.current) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled || !stageRef.current) return;
      const stage = stageRef.current;
      const styles = window.getComputedStyle(stage);
      const horizontalPadding = (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
      const availableWidth = Math.max(1, stage.clientWidth - horizontalPadding - 2);
      setFitScale(Math.max(0.1, Math.min(1.2, availableWidth / A4_WIDTH)));
      setFitScaleReady(true);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stageRef.current);
    return () => { cancelled = true; observer.disconnect(); };
  }, [pdf, isImage, fullscreen]);

  useEffect(() => {
    if (!resource) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreen);
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !document.fullscreenElement) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('keydown', onKey);
    };
  }, [resource, onClose]);

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
            <div className="min-w-0"><strong>{resource.title}</strong><span>Class {resource.class_level} · {resource.subject}{pageCount ? ` · ${pageCount} pages` : ''}</span></div>
          </div>
          <div className="pdf-reader-actions">
            <button type="button" onClick={() => changeZoom(zoomRef.current - READER_ZOOM_STEP)} disabled={zoomLevel <= MIN_READER_ZOOM} aria-label="Zoom out"><Minus /></button>
            <span className="pdf-reader-zoom" aria-live="polite">{Math.round(zoomLevel * 100)}%</span>
            <button type="button" onClick={() => changeZoom(zoomRef.current + READER_ZOOM_STEP)} disabled={zoomLevel >= MAX_READER_ZOOM} aria-label="Zoom in"><Plus /></button>
            <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>{fullscreen ? <Minimize2 /> : <Maximize2 />}</button>
            <a href={fileUrl} download={resource.file_name || resource.title} aria-label="Download"><Download /></a>
            <button type="button" onClick={onClose} aria-label="Close reader"><X /></button>
          </div>
        </header>
        <main ref={stageRef} className={`pdf-reader-stage${allPagesReady || isImage || failed ? '' : ' is-preloading'}`} aria-busy={!allPagesReady && !isImage && !failed}>
          {isImage ? (
            <div className="pdf-reader-image"><img src={fileUrl} alt={resource.title} /></div>
          ) : failed ? (
            <div className="pdf-reader-error"><AlertTriangle /><strong>Couldn’t open this document.</strong><span>Please try again.</span><button type="button" onClick={() => window.location.reload()}><RefreshCw /> Try again</button></div>
          ) : loading || !fitScaleReady ? (
            <div className="pdf-reader-loading">
              <div className="pdf-load-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loadProgress} aria-label={`Opening note ${loadProgress}%`}><div className="pdf-load-progress-bar" style={{ width: `${Math.max(4, loadProgress)}%` }} /></div>
              <strong>{loadProgress > 0 ? `Opening note · ${loadProgress}%` : 'Opening note…'}</strong><span>Preparing the pages inside Archivum.</span>
            </div>
          ) : (
            <div className="pdf-reader-pages" style={{
              '--pdf-css-width': `${A4_WIDTH * fitScale * zoomLevel}px`,
              '--pdf-css-height': `${A4_HEIGHT * fitScale * zoomLevel}px`,
            } as React.CSSProperties}>
              {Array.from({ length: pageCount }, (_, index) => (
                <PdfPage key={`${fileKey}-${index + 1}`} pdf={pdf} pageNumber={index + 1} fileKey={fileKey} onSettled={onPageSettled} />
              ))}
            </div>
          )}
          {!isImage && !failed && !loading && fitScaleReady && !allPagesReady && (
            <div className="pdf-reader-preloader" role="status" aria-live="polite">
              <div className="pdf-load-progress" role="progressbar" aria-valuemin={0} aria-valuemax={pageCount} aria-valuenow={settledPages.size} aria-label={`Preparing pages ${settledPages.size} of ${pageCount}`}><div className="pdf-load-progress-bar" style={{ width: `${pageCount ? Math.max(4, settledPages.size / pageCount * 100) : 4}%` }} /></div>
              <strong>Preparing pages · {settledPages.size}/{pageCount}</strong><span>Opening as soon as every page is ready.</span>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
