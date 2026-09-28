'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Resource } from '@/lib/resources';
import { X, ExternalLink, Download, FileText, ZoomIn, ZoomOut, RotateCcw, Maximize2, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

type PDFPageProxy = { getViewport: (options: { scale: number }) => { width: number; height: number }; render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number }; intent?: string }) => { promise: Promise<unknown>; cancel?: () => void } };
type PDFDocumentProxy = { numPages: number; getPage: (n: number) => Promise<PDFPageProxy>; destroy: () => Promise<void> };
interface Props { resource: Resource | null; onClose: () => void; }

export default function PdfViewerModal({ resource, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [renderedPages, setRenderedPages] = useState(0);
  const [retry, setRetry] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const renderToken = useRef(0);

  const fileUrl = resource ? `/api/resources/${resource.id}/file` : '';
  const isImage = Boolean(resource && (resource.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(resource.file_name || '')));

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
      renderToken.current += 1;
      const token = renderToken.current;
      if (docRef.current) {
        await docRef.current.destroy().catch(() => {});
        docRef.current = null;
      }
      try {
        const response = await fetch(fileUrl, { signal: controller.signal, cache: 'force-cache' });
        if (!response.ok) throw new Error(`PDF request failed: ${response.status}`);
        const buffer = await response.arrayBuffer();
        if (cancelled) return;
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const documentProxy = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise as unknown as PDFDocumentProxy;
        if (cancelled) {
          await documentProxy.destroy().catch(() => {});
          return;
        }
        docRef.current = documentProxy;
        setPageCount(documentProxy.numPages);
        setLoading(false);
        requestAnimationFrame(() => renderPages(documentProxy, token));
      } catch (error) {
        if (cancelled || (error instanceof DOMException && error.name === 'AbortError')) return;
        console.error('[ARCHIVUM PDF reader]', error);
        setLoading(false);
        setFailed(true);
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
      renderToken.current += 1;
      docRef.current?.destroy().catch(() => {});
      docRef.current = null;
      stageRef.current?.querySelectorAll('[data-pdf-page]').forEach(node => node.remove());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource?.id, fileUrl, isImage, retry]);

  const renderPages = async (documentProxy: PDFDocumentProxy, token: number) => {
    const stage = stageRef.current;
    if (!stage || token !== renderToken.current) return;
    stage.querySelectorAll('[data-pdf-page]').forEach(node => node.remove());
    const availableWidth = Math.max(280, stage.clientWidth - 32);
    let completed = 0;
    for (let pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber += 1) {
      if (token !== renderToken.current) return;
      const page = await documentProxy.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.max(0.55, Math.min(2.2, (availableWidth / baseViewport.width) * zoom));
      const viewport = page.getViewport({ scale });
      const wrapper = document.createElement('div');
      wrapper.dataset.pdfPage = 'true';
      wrapper.className = 'pdf-page-wrap';
      wrapper.setAttribute('aria-label', `Page ${pageNumber}`);
      const canvas = document.createElement('canvas');
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(viewport.width * ratio);
      canvas.height = Math.ceil(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('Canvas unavailable');
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, viewport.width, viewport.height);
      wrapper.appendChild(canvas);
      stage.appendChild(wrapper);
      await page.render({ canvasContext: context, viewport, intent: 'display' }).promise;
      completed += 1;
      setRenderedPages(completed);
    }
  };

  useEffect(() => {
    if (!docRef.current || isImage || loading || failed) return;
    const token = renderToken.current + 1;
    renderToken.current = token;
    renderPages(docRef.current, token).catch(error => {
      console.error('[ARCHIVUM PDF render]', error);
      setFailed(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

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

        <div className="pdf-reader-stage" ref={stageRef}>
          {isImage && <div className="pdf-reader-image-wrap"><img src={fileUrl} alt={resource.title} /></div>}
          {!isImage && loading && !failed && <div className="pdf-reader-loading"><div className="pdf-reader-loading-card"><Loader2 className="animate-spin"/><strong>Opening {resource.resource_type || 'document'}</strong><span>Getting the pages ready…</span></div></div>}
          {!isImage && failed && <div className="pdf-reader-error"><div className="pdf-reader-error-card"><div className="pdf-reader-error-icon"><AlertTriangle /></div><h3>This document could not be rendered here.</h3><p>You can retry the reader or open the original file.</p><div className="pdf-reader-error-actions"><button type="button" className="pdf-reader-primary" onClick={() => setRetry(value => value + 1)}><RefreshCw/> Try again</button><button type="button" className="pdf-reader-secondary" onClick={openOriginal}><ExternalLink/> Open file</button><a className="pdf-reader-secondary" href={fileUrl} download={resource.file_name || resource.title}><Download/> Download</a></div></div></div>}
        </div>

        <footer className="pdf-reader-footer"><span>Scroll to read</span><span>{resource.file_name || 'document.pdf'}</span><button type="button" onClick={() => stageRef.current?.requestFullscreen?.()} aria-label="Fullscreen"><Maximize2 /></button></footer>
      </section>
    </div>
  );
}
