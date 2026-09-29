'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Resource } from '@/lib/resources';
import { X, ExternalLink, Download, FileText, ZoomIn, ZoomOut, RotateCcw, Maximize2, Loader2, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

type Viewport = { width: number; height: number };
type PDFPageProxy = {
  getViewport: (options: { scale: number }) => Viewport;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: Viewport; intent?: string }) => { promise: Promise<unknown>; cancel?: () => void };
};
type PDFDocumentProxy = { numPages: number; getPage: (n: number) => Promise<PDFPageProxy>; destroy: () => Promise<void> };
interface Props { resource: Resource | null; onClose: () => void; }

export default function PdfViewerModal({ resource, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [renderedPages, setRenderedPages] = useState(0);
  const [retry, setRetry] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageMotion, setPageMotion] = useState<'next' | 'prev'>('next');
  const stageRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const renderToken = useRef(0);

  useEffect(() => {
    const update = () => setIsMobile(window.matchMedia('(max-width: 700px)').matches);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const renderedSet = useRef<Set<number>>(new Set());
  const touchStartX = useRef<number | null>(null);
  const lastTapAt = useRef(0);

  const fileUrl = resource ? `/api/resources/${resource.id}/file` : '';
  const isImage = Boolean(resource && (resource.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(resource.file_name || '')));

  const renderPage = async (documentProxy: PDFDocumentProxy, pageNumber: number, token: number) => {
    const stage = stageRef.current;
    if (!stage || token !== renderToken.current || renderedSet.current.has(pageNumber)) return;
    const wrapper = stage.querySelector(`[data-pdf-page="${pageNumber}"]`) as HTMLElement | null;
    if (!wrapper) return;
    try {
      const page = await documentProxy.getPage(pageNumber);
      if (token !== renderToken.current) return;
      const baseViewport = page.getViewport({ scale: 1 });
      const frameWidth = Math.max(220, wrapper.clientWidth || stage.clientWidth - 18);
      const frameHeight = Math.max(320, wrapper.clientHeight || frameWidth * 1.414);
      const fitScale = Math.min((frameWidth - 8) / baseViewport.width, (frameHeight - 8) / baseViewport.height);
      const scale = Math.max(0.45, Math.min(2.2, fitScale * zoom));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(viewport.width * ratio);
      canvas.height = Math.ceil(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '100%';
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('Canvas unavailable');
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, viewport.width, viewport.height);
      wrapper.replaceChildren(canvas);
      await page.render({ canvasContext: context, viewport, intent: 'display' }).promise;
      if (token !== renderToken.current) return;
      renderedSet.current.add(pageNumber);
      setRenderedPages(renderedSet.current.size);
    } catch (error) {
      if (token === renderToken.current) console.error('[ARCHIVUM PDF page]', error);
    }
  };

  const prepareStage = async (documentProxy: PDFDocumentProxy, token: number) => {
    const stage = stageRef.current;
    if (!stage || token !== renderToken.current) return;
    observerRef.current?.disconnect();
    renderedSet.current = new Set();
    setRenderedPages(0);
    stage.querySelectorAll('[data-pdf-page]').forEach(node => node.remove());

    if (token !== renderToken.current) return;
    const availableWidth = Math.max(220, Math.min(stage.clientWidth - 18, 980));
    const frameWidth = isMobile ? Math.min(availableWidth, window.innerWidth - 18) : availableWidth;
    const frameHeight = isMobile ? Math.max(320, stage.clientHeight - 16) : Math.max(420, frameWidth * 1.414);

    const addPage = (pageNumber: number) => {
      const wrapper = document.createElement('div');
      wrapper.dataset.pdfPage = String(pageNumber);
      wrapper.className = isMobile ? 'pdf-mobile-page pdf-page-placeholder' : 'pdf-page-wrap pdf-page-placeholder';
      wrapper.setAttribute('aria-label', `Page ${pageNumber}`);
      wrapper.style.width = `${frameWidth}px`;
      wrapper.style.height = `${frameHeight}px`;
      wrapper.style.minHeight = '0';
      wrapper.innerHTML = `<span>Page ${pageNumber}</span>`;
      stage.appendChild(wrapper);
    };

    if (isMobile) {
      const safePage = Math.min(Math.max(currentPage, 1), documentProxy.numPages);
      if (safePage !== currentPage) setCurrentPage(safePage);
      addPage(safePage);
      void renderPage(documentProxy, safePage, token);
      return;
    }

    for (let pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber += 1) addPage(pageNumber);
    const wrappers = Array.from(stage.querySelectorAll<HTMLElement>('[data-pdf-page]'));
    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pageNumber = Number((entry.target as HTMLElement).dataset.pdfPage);
          void renderPage(documentProxy, pageNumber, token);
        }
      });
    }, { root: stage, rootMargin: '900px 0px', threshold: 0.01 });
    wrappers.forEach(wrapper => observerRef.current?.observe(wrapper));
    void renderPage(documentProxy, 1, token);
  };

  useEffect(() => {
    if (!resource) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [resource]);

  useEffect(() => {
    if (!resource || isImage) return;
    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setFailed(false);
      setPageCount(0);
      setRenderedPages(0);
      setZoom(1);
      setCurrentPage(1);
      renderedSet.current = new Set();
      renderToken.current += 1;
      const token = renderToken.current;
      observerRef.current?.disconnect();
      if (docRef.current) {
        await docRef.current.destroy().catch(() => {});
        docRef.current = null;
      }
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        if (cancelled) return;
        const documentProxy = await pdfjs.getDocument({ url: fileUrl, disableAutoFetch: false, disableStream: false }).promise as unknown as PDFDocumentProxy;
        if (cancelled) {
          await documentProxy.destroy().catch(() => {});
          return;
        }
        docRef.current = documentProxy;
        setPageCount(documentProxy.numPages);
        setLoading(false);
        requestAnimationFrame(() => { void prepareStage(documentProxy, token); });
      } catch (error) {
        if (cancelled || (error instanceof DOMException && error.name === 'AbortError')) return;
        console.error('[ARCHIVUM PDF reader]', error);
        setLoading(false);
        setFailed(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
      controller.abort();
      renderToken.current += 1;
      observerRef.current?.disconnect();
      docRef.current?.destroy().catch(() => {});
      docRef.current = null;
      stageRef.current?.querySelectorAll('[data-pdf-page]').forEach(node => node.remove());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource?.id, fileUrl, isImage, retry]);

  useEffect(() => {
    if (!docRef.current || isImage || loading || failed) return;
    const documentProxy = docRef.current;
    const token = renderToken.current + 1;
    renderToken.current = token;
    // Rebuild placeholders on zoom instead of synchronously rendering every page.
    void prepareStage(documentProxy, token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, isMobile, currentPage]);

  useEffect(() => {
    if (!resource) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if ((event.ctrlKey || event.metaKey) && event.key === '+') { event.preventDefault(); setZoom(value => Math.min(2.2, value + 0.1)); }
      if ((event.ctrlKey || event.metaKey) && event.key === '-') { event.preventDefault(); setZoom(value => Math.max(0.65, value - 0.1)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resource, onClose]);

  if (!resource) return null;
  const openOriginal = () => window.open(fileUrl, '_blank', 'noopener,noreferrer');

  return (
    <div className="pdf-reader-shell" role="dialog" aria-modal="true" aria-label={`Reading ${resource.title}`}>
      <button className="pdf-reader-backdrop" onClick={onClose} aria-label="Close reader" />
      <section className="pdf-reader-window">
        <header className="pdf-reader-header">
          <div className="pdf-reader-title">
            <div className="pdf-reader-file-icon"><FileText /></div>
            <div className="min-w-0"><strong>{resource.title}</strong><span>Class {resource.class_level} · {resource.subject} · {resource.resource_type || 'Notes'}</span></div>
          </div>
          <div className="pdf-reader-actions">
            {!isImage && <><button type="button" onClick={() => setZoom(value => Math.max(.65, value - .1))} aria-label="Zoom out"><ZoomOut /></button><span className="pdf-reader-zoom">{Math.round(zoom * 100)}%</span><button type="button" onClick={() => setZoom(value => Math.min(2.2, value + .1))} aria-label="Zoom in"><ZoomIn /></button><button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom"><RotateCcw /></button><span className="pdf-reader-page">{renderedPages}/{pageCount}</span></>}
            <button type="button" onClick={openOriginal} aria-label="Open file in new tab"><ExternalLink /></button>
            <a href={fileUrl} download={resource.file_name || resource.title} aria-label="Download document"><Download /></a>
            <button type="button" onClick={onClose} aria-label="Close reader"><X /></button>
          </div>
        </header>

        <div className={`pdf-reader-stage ${isMobile && !isImage ? 'mobile-page-mode' : ''} page-motion-${pageMotion}`} ref={stageRef}
          onClick={event => {
            if (!isMobile || isImage) return;
            const now = Date.now();
            if (now - lastTapAt.current < 320) {
              setZoom(value => value > 1.05 ? 1 : 1.35);
              lastTapAt.current = 0;
              return;
            }
            lastTapAt.current = now;
            if (pageCount < 2) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            if (x > rect.width * 0.58) { setPageMotion('next'); setCurrentPage(page => Math.min(pageCount, page + 1)); }
            else if (x < rect.width * 0.42) { setPageMotion('prev'); setCurrentPage(page => Math.max(1, page - 1)); }
          }}
          onTouchStart={event => { if (isMobile) touchStartX.current = event.changedTouches[0]?.clientX ?? null; }}
          onTouchEnd={event => {
            if (!isMobile || isImage || touchStartX.current == null) return;
            const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
            const delta = endX - touchStartX.current;
            if (Math.abs(delta) > 45) if (delta < 0) { setPageMotion('next'); setCurrentPage(page => Math.min(pageCount, page + 1)); } else { setPageMotion('prev'); setCurrentPage(page => Math.max(1, page - 1)); }
            touchStartX.current = null;
          }}>
          {isImage && <div className="pdf-reader-image-wrap"><img src={fileUrl} alt={resource.title} /></div>}
          {!isImage && loading && !failed && <div className="pdf-reader-loading"><div className="pdf-reader-loading-card"><Loader2 className="animate-spin"/><strong>Opening {resource.resource_type || 'document'}</strong><span>Getting the first page ready…</span></div></div>}
          {!isImage && failed && <div className="pdf-reader-error"><div className="pdf-reader-error-card"><div className="pdf-reader-error-icon"><AlertTriangle /></div><h3>This document could not be rendered here.</h3><p>You can retry the reader or open the original file.</p><div className="pdf-reader-error-actions"><button type="button" className="pdf-reader-primary" onClick={() => setRetry(value => value + 1)}><RefreshCw/> Try again</button><button type="button" className="pdf-reader-secondary" onClick={openOriginal}><ExternalLink/> Open file</button><a className="pdf-reader-secondary" href={fileUrl} download={resource.file_name || resource.title}><Download/> Download</a></div></div></div>}
        </div>
        {!isImage && isMobile && pageCount > 0 && <>
          <button type="button" className="pdf-mobile-side pdf-mobile-side-prev" onClick={(event) => { event.stopPropagation(); setPageMotion('prev'); setCurrentPage(page => Math.max(1, page - 1)); }} disabled={currentPage <= 1} aria-label="Previous page"><ChevronLeft /></button>
          <button type="button" className="pdf-mobile-side pdf-mobile-side-next" onClick={(event) => { event.stopPropagation(); setPageMotion('next'); setCurrentPage(page => Math.min(pageCount, page + 1)); }} disabled={currentPage >= pageCount} aria-label="Next page"><ChevronRight /></button>
          <div className="pdf-mobile-controls">
            <button type="button" onClick={() => { setPageMotion('prev'); setCurrentPage(page => Math.max(1, page - 1)); }} disabled={currentPage <= 1} aria-label="Previous page"><ChevronLeft /></button>
            <button type="button" onClick={() => { setPageMotion('next'); setCurrentPage(page => Math.min(pageCount, page + 1)); }} disabled={currentPage >= pageCount} aria-label="Next page"><ChevronRight /></button>
          </div>
        </>}
        {!isImage && isMobile && pageCount > 0 && <div className="pdf-mobile-counter">{currentPage} / {pageCount}</div>}

        <footer className="pdf-reader-footer"><span>{isMobile ? 'Use the arrows to change pages' : 'Scroll to read'}</span><span>{resource.file_name || 'document.pdf'}</span><button type="button" onClick={() => stageRef.current?.requestFullscreen?.()} aria-label="Fullscreen"><Maximize2 /></button></footer>
      </section>
    </div>
  );
}
