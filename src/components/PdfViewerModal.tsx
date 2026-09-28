'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Resource } from '@/lib/resources';
import {
  X, ExternalLink, Download, FileText, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Loader2, AlertTriangle, RefreshCw
} from 'lucide-react';

type PdfPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: unknown; intent?: string }) => { promise: Promise<unknown>; cancel?: () => void };
};
type PdfDocument = { numPages: number; getPage: (pageNumber: number) => Promise<PdfPage>; destroy: () => Promise<void> };
type PdfJs = { getDocument: (options: { url: string; disableWorker: boolean; disableStream?: boolean; disableAutoFetch?: boolean; rangeChunkSize?: number }) => { promise: Promise<PdfDocument> } };

interface PdfViewerModalProps { resource: Resource | null; onClose: () => void; }

export default function PdfViewerModal({ resource, onClose }: PdfViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rendered, setRendered] = useState(false);
  const [retry, setRetry] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<PdfDocument | null>(null);
  const renderTaskRef = useRef<{ cancel?: () => void } | null>(null);

  const fileUrl = resource ? `/api/resources/${resource.id}/file` : '';
  const isImage = Boolean(resource && (resource.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(resource.file_name || '')));

  useEffect(() => {
    if (!resource || isImage) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true); setFailed(false); setRendered(false); setPage(1); setPageCount(0); setZoom(1);
      renderTaskRef.current?.cancel?.();
      await documentRef.current?.destroy().catch(() => undefined);
      documentRef.current = null;
      try {
        const probe = await fetch(fileUrl, { method: 'HEAD', cache: 'no-store' });
        if (!probe.ok) throw new Error(`Document endpoint returned ${probe.status}`);
        const module = await import('pdfjs-dist/legacy/build/pdf.mjs');
        if (cancelled) return;
        const pdfjs = module as unknown as PdfJs;
        const document = await pdfjs.getDocument({ url: fileUrl, disableWorker: true, disableStream: false, disableAutoFetch: false, rangeChunkSize: 262144 }).promise;
        if (cancelled) { await document.destroy().catch(() => undefined); return; }
        documentRef.current = document;
        setPageCount(document.numPages);
        setLoading(false);
      } catch (error) {
        console.error('[pdf-reader]', error);
        if (!cancelled) { setLoading(false); setFailed(true); }
      }
    };
    load();
    return () => { cancelled = true; renderTaskRef.current?.cancel?.(); documentRef.current?.destroy().catch(() => undefined); documentRef.current = null; };
  }, [resource?.id, fileUrl, isImage, retry]);

  useEffect(() => {
    if (!resource) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (!isImage && event.key === 'ArrowLeft') setPage(v => Math.max(1, v - 1));
      if (!isImage && event.key === 'ArrowRight') setPage(v => Math.min(pageCount || v + 1, v + 1));
      if (!isImage && (event.ctrlKey || event.metaKey) && event.key === '+') { event.preventDefault(); setZoom(v => Math.min(2.5, v + .1)); }
      if (!isImage && (event.ctrlKey || event.metaKey) && event.key === '-') { event.preventDefault(); setZoom(v => Math.max(.6, v - .1)); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [resource, onClose, isImage, pageCount]);

  useEffect(() => {
    if (isImage || !documentRef.current || !canvasRef.current || !stageRef.current) return;
    let cancelled = false;
    const render = async () => {
      const doc = documentRef.current; const canvas = canvasRef.current; const stage = stageRef.current;
      if (!doc || !canvas || !stage) return;
      renderTaskRef.current?.cancel?.();
      const pdfPage = await doc.getPage(page); if (cancelled) return;
      const base = pdfPage.getViewport({ scale: 1 });
      const availableWidth = Math.max(280, stage.clientWidth - 56);
      const fitScale = Math.min(1.65, availableWidth / base.width);
      const scale = Math.max(.55, fitScale * zoom);
      const viewport = pdfPage.getViewport({ scale });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(viewport.width * ratio); canvas.height = Math.ceil(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
      const context = canvas.getContext('2d', { alpha: false }); if (!context) throw new Error('Canvas unavailable');
      context.setTransform(ratio, 0, 0, ratio, 0, 0); context.fillStyle = '#fff'; context.fillRect(0, 0, viewport.width, viewport.height);
      const task = pdfPage.render({ canvasContext: context, viewport, intent: 'display' }); renderTaskRef.current = task;
      await task.promise; if (!cancelled) { setRendered(true); setLoading(false); }
    };
    render().catch(error => { if (!cancelled && error?.name !== 'RenderingCancelledException') { console.error('[pdf-page]', error); setFailed(true); setLoading(false); } });
    return () => { cancelled = true; renderTaskRef.current?.cancel?.(); };
  }, [page, zoom, isImage, pageCount]);

  if (!resource) return null;
  const changeZoom = (delta: number) => setZoom(v => Math.min(2.5, Math.max(.6, v + delta)));
  const openOriginal = () => window.open(fileUrl, '_blank', 'noopener,noreferrer');

  return <div className="pdf-reader-shell" role="dialog" aria-modal="true" aria-label={`Reading ${resource.title}`}>
    <div className="pdf-reader-backdrop" onClick={onClose}/>
    <section className="pdf-reader-window">
      <header className="pdf-reader-header">
        <div className="min-w-0 flex items-center gap-3"><div className="pdf-reader-file-icon"><FileText/></div><div className="min-w-0"><strong className="block truncate">{resource.title}</strong><span className="block truncate">Class {resource.class_level} · {resource.subject} · {resource.resource_type || 'Notes'}</span></div></div>
        <div className="pdf-reader-actions">
          {!isImage && <><button type="button" onClick={()=>changeZoom(-.1)} aria-label="Zoom out"><ZoomOut/></button><span className="pdf-reader-zoom">{Math.round(zoom*100)}%</span><button type="button" onClick={()=>changeZoom(.1)} aria-label="Zoom in"><ZoomIn/></button><button type="button" onClick={()=>{setPage(1);setZoom(1)}} aria-label="Reset view"><RotateCcw/></button><button type="button" onClick={()=>setPage(v=>Math.max(1,v-1))} disabled={page<=1} aria-label="Previous page"><ChevronLeft/></button><div className="pdf-reader-page"><strong>{page}</strong><span>/ {pageCount||'—'}</span></div><button type="button" onClick={()=>setPage(v=>Math.min(pageCount||v+1,v+1))} disabled={pageCount>0&&page>=pageCount} aria-label="Next page"><ChevronRight/></button></>}
          <button type="button" onClick={openOriginal} aria-label="Open in new tab"><ExternalLink/></button><a href={fileUrl} download={resource.file_name || resource.title} aria-label="Download"><Download/></a><button type="button" onClick={onClose} aria-label="Close reader"><X/></button>
        </div>
      </header>
      <div className="pdf-reader-stage" ref={stageRef}>
        {isImage ? <div className="pdf-reader-image-wrap"><img src={fileUrl} alt={resource.title} onLoad={()=>setLoading(false)} onError={()=>{setLoading(false);setFailed(true)}}/></div> : <div className="pdf-reader-canvas-wrap"><canvas ref={canvasRef}/></div>}
        {loading&&!failed&&<div className="pdf-reader-loading"><div className="pdf-reader-loading-card"><Loader2 className="animate-spin"/><strong>Preparing the reader</strong><span>Opening the document…</span></div></div>}
        {failed&&<div className="pdf-reader-error"><div className="pdf-reader-error-card"><div className="pdf-reader-error-icon"><AlertTriangle/></div><h3>This document could not be opened.</h3><p>Try the reader again or use the original file. The document itself has not been modified.</p><div className="flex flex-wrap justify-center gap-2 mt-5"><button className="pdf-reader-primary" type="button" onClick={()=>setRetry(v=>v+1)}><RefreshCw/> Try again</button><button className="pdf-reader-secondary" type="button" onClick={openOriginal}><ExternalLink/> Open file</button><a className="pdf-reader-secondary" href={fileUrl} download={resource.file_name || resource.title}><Download/> Download</a></div></div></div>}
      </div>
      <footer className="pdf-reader-footer"><span>{rendered ? 'Ready' : 'Reader'}</span><span>{resource.file_name || 'document.pdf'}</span><button type="button" onClick={()=>stageRef.current?.requestFullscreen?.()} aria-label="Fullscreen"><Maximize2/></button></footer>
    </section>
  </div>;
}
