'use client';

import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Resource } from '@/lib/resources';
import { readPdfPage, writePdfPage } from '@/lib/pdfPageCache';
import { getReaderProgress, saveReaderProgress, getNightMode, setNightMode } from '@/lib/readerState';
import { getOfflinePdf, hasOfflinePdf, offlineSupported, removeOfflinePdf, saveOfflinePdf } from '@/lib/offlinePdfs';
import { addRecentlyViewed } from '@/lib/savedStorage';
import { useToast } from '@/components/ToastContext';
import { X, Download, FileText, Maximize2, Minimize2, AlertTriangle, RefreshCw, Minus, Plus, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Moon, Sun, HardDriveDownload, Check } from 'lucide-react';

interface Props { resource: Resource | null; onClose: () => void; }

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const PAGE_CACHE_DPR = 2;
const MIN_READER_ZOOM = 0.5;
const MAX_READER_ZOOM = 4;
const INITIAL_READER_ZOOM = 1;
const READER_ZOOM_STEP = 0.25;
const DOUBLE_TAP_ZOOM = 2.2;
const MAX_HIRES_QUALITY = 4;
const MAX_HIRES_PIXELS = 12_000_000;
const CHROME_HIDE_DELAY = 3000;

const pdfDocuments = new Map<string, Promise<any>>();

type Focal = { x: number; y: number };
type ZoomAnchor = { ratio: number; x0: number; y0: number; x1: number; y1: number; sx: number; sy: number };

function loadPdfDocument(fileUrl: string, fileKey: string, onProgress: (loaded: number, total: number) => void) {
  const existing = pdfDocuments.get(fileKey);
  if (existing) return existing;
  const pending = (async () => {
    const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    const openOnline = () => {
      const task = pdfjs.getDocument({ url: fileUrl, rangeChunkSize: 512 * 1024, disableAutoFetch: false, disableStream: false });
      (task as any).onProgress = ({ loaded, total }: { loaded: number; total: number }) => onProgress(loaded, total);
      return task.promise;
    };
    // A saved copy opens instantly. If it is damaged or unreadable, drop it and fall back to the normal download.
    const saved = await getOfflinePdf(fileKey);
    if (saved) {
      try {
        return await pdfjs.getDocument({ data: new Uint8Array(saved) }).promise;
      } catch {
        try { await removeOfflinePdf(Number(fileKey.split(':')[0])); } catch { /* ignore */ }
      }
    }
    return openOnline();
  })();
  pdfDocuments.set(fileKey, pending);
  pending.catch(() => { if (pdfDocuments.get(fileKey) === pending) pdfDocuments.delete(fileKey); });
  return pending;
}

// Closing the reader must hand the document's memory back. On phones, pages and PDFs left behind exhaust GPU memory
// and the browser starts painting black rectangles over fixed layers (like the bottom nav) until a full reload.
function releasePdfDocument(fileKey: string, document: any) {
  pdfDocuments.delete(fileKey);
  try { document?.destroy?.(); } catch { /* already gone */ }
}

/** Wraps every occurrence of `query` inside the text-layer spans; returns the active mark (if any). */
function highlightSpans(container: HTMLElement, query: string, activeOrdinal: number): HTMLElement | null {
  const needle = query.toLowerCase();
  let ordinal = 0;
  let current: HTMLElement | null = null;
  container.querySelectorAll<HTMLElement>('span:not(.markedContent)').forEach((span) => {
    const source = span.dataset.src ?? (span.dataset.src = span.textContent ?? '');
    if (!source) return;
    const lower = source.toLowerCase();
    let index = needle ? lower.indexOf(needle) : -1;
    if (index < 0) { if (span.childElementCount) span.textContent = source; return; }
    const fragment = document.createDocumentFragment();
    let last = 0;
    while (index >= 0) {
      if (index > last) fragment.append(source.slice(last, index));
      const mark = document.createElement('mark');
      mark.className = ordinal === activeOrdinal ? 'pdf-hit is-current' : 'pdf-hit';
      mark.textContent = source.slice(index, index + needle.length);
      if (ordinal === activeOrdinal) current = mark;
      fragment.append(mark);
      ordinal += 1;
      last = index + needle.length;
      index = lower.indexOf(needle, last);
    }
    if (last < source.length) fragment.append(source.slice(last));
    span.replaceChildren(fragment);
  });
  return current;
}

/** Same matching rule as highlightSpans, so the match count and the highlights stay in step. */
function countMatches(items: string[], query: string) {
  const needle = query.toLowerCase();
  let total = 0;
  for (const item of items) {
    const lower = item.toLowerCase();
    let index = lower.indexOf(needle);
    while (index >= 0) { total += 1; index = lower.indexOf(needle, index + needle.length); }
  }
  return total;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9));
}

/** Watches an element and reports whether it is within `margin` of the scroll container. */
function useNearViewport(hostRef: React.RefObject<HTMLDivElement | null>, rootRef: React.RefObject<HTMLElement | null>, margin: string) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return; }
    const observer = new IntersectionObserver(
      (entries) => { for (const entry of entries) setNear(entry.isIntersecting); },
      { root: rootRef.current, rootMargin: margin },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [hostRef, rootRef, margin]);
  return near;
}

const PdfPage = memo(function PdfPage({ pdf, pageNumber, fileKey, displayScale, zoomLevel, settledZoom, stageRef, query, activeOrdinal, focusToken }: {
  pdf: any; pageNumber: number; fileKey: string; displayScale: number; zoomLevel: number; settledZoom: number;
  stageRef: React.RefObject<HTMLElement | null>; query: string; activeOrdinal: number; focusToken: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiCanvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef(0);
  const [rendered, setRendered] = useState(false);
  const [textLayout, setTextLayout] = useState<{ contentScale: number; offX: number; offY: number } | null>(null);
  const [textReady, setTextReady] = useState(false);
  const baseDoneRef = useRef(false);
  const near = useNearViewport(hostRef, stageRef, '1400px 0px');
  const visible = useNearViewport(hostRef, stageRef, '250px 0px');

  const cssWidth = A4_WIDTH * displayScale * zoomLevel;
  const cssHeight = A4_HEIGHT * displayScale * zoomLevel;

  // Base render (cached, low zoom). Pages only render once they are near the viewport.
  useEffect(() => () => {
    for (const c of [canvasRef.current, hiCanvasRef.current]) { if (c) { c.width = 0; c.height = 0; } }
  }, []);

  useEffect(() => {
    if (!pdf || !near || baseDoneRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let task: any = null;

    (async () => {
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
          task = page.render({ canvasContext: context, viewport, transform: [PAGE_CACHE_DPR, 0, 0, PAGE_CACHE_DPR, offsetX, offsetY], intent: 'display' });
          await task.promise;
          if (cancelled) return;
          const blob = await canvasBlob(canvas);
          if (blob && !cancelled) await writePdfPage(cacheKey, blob);
        }
        if (!cancelled) { baseDoneRef.current = true; setRendered(true); }
      } catch (error: any) {
        if (!cancelled && error?.name !== 'RenderingCancelledException') setRendered(false);
      }
    })();

    return () => { cancelled = true; task?.cancel?.(); };
  }, [pdf, pageNumber, fileKey, near]);

  // Sharp render for zoomed-in pages that are actually on screen.
  useEffect(() => {
    const hi = hiCanvasRef.current;
    if (!hi) return;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 1;
    const wanted = displayScale * settledZoom * dpr;
    const clear = () => { if (hi.width !== 0) { hi.width = 0; hi.height = 0; } };
    if (!pdf || !visible || !rendered || wanted <= PAGE_CACHE_DPR * 1.05) { clear(); return; }

    const pixelCap = Math.sqrt(MAX_HIRES_PIXELS / (A4_WIDTH * A4_HEIGHT));
    const quality = Math.min(wanted, MAX_HIRES_QUALITY, pixelCap);
    let cancelled = false;
    let task: any = null;

    (async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const baseViewport = page.getViewport({ scale: 1 });
        const contentScale = Math.min(A4_WIDTH / baseViewport.width, A4_HEIGHT / baseViewport.height);
        const viewport = page.getViewport({ scale: contentScale });
        const off = document.createElement('canvas');
        off.width = Math.round(A4_WIDTH * quality);
        off.height = Math.round(A4_HEIGHT * quality);
        const context = off.getContext('2d', { alpha: false });
        if (!context) return;
        context.fillStyle = '#fff';
        context.fillRect(0, 0, off.width, off.height);
        const offsetX = (off.width - viewport.width * quality) / 2;
        const offsetY = (off.height - viewport.height * quality) / 2;
        task = page.render({ canvasContext: context, viewport, transform: [quality, 0, 0, quality, offsetX, offsetY], intent: 'display' });
        await task.promise;
        if (cancelled) return;
        hi.width = off.width;
        hi.height = off.height;
        hi.getContext('2d')?.drawImage(off, 0, 0);
        off.width = 0; off.height = 0;
      } catch { /* cancelled or failed: keep the base render */ }
    })();

    return () => { cancelled = true; task?.cancel?.(); };
  }, [pdf, pageNumber, visible, rendered, displayScale, settledZoom]);

  // Selectable / searchable text layer, aligned to the same A4 box the canvas is drawn into.
  useEffect(() => {
    const container = textRef.current;
    if (!container) return;
    if (!pdf || !near) { container.replaceChildren(); setTextReady(false); return; }
    let cancelled = false;
    let layer: any = null;
    (async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const contentScale = Math.min(A4_WIDTH / base.width, A4_HEIGHT / base.height);
        const textContent = await page.getTextContent();
        if (cancelled) return;
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
        container.replaceChildren();
        layer = new pdfjs.TextLayer({ textContentSource: textContent, container, viewport: base });
        await layer.render();
        if (cancelled) return;
        setTextLayout({ contentScale, offX: (A4_WIDTH - base.width * contentScale) / 2, offY: (A4_HEIGHT - base.height * contentScale) / 2 });
        setTextReady(true);
      } catch { /* scanned page or cancelled: the canvas still shows the page */ }
    })();
    return () => { cancelled = true; try { layer?.cancel(); } catch { /* ignore */ } };
  }, [pdf, pageNumber, near]);

  useEffect(() => {
    const container = textRef.current;
    if (!container || !textReady) return;
    const current = highlightSpans(container, query, activeOrdinal);
    if (current && focusToken !== lastFocusRef.current) {
      lastFocusRef.current = focusToken;
      current.scrollIntoView({ block: 'center', inline: 'center' });
    }
  }, [textReady, query, activeOrdinal, focusToken]);

  const perUnit = displayScale * zoomLevel;
  const textStyle = textLayout ? ({
    left: textLayout.offX * perUnit,
    top: textLayout.offY * perUnit,
    '--scale-factor': textLayout.contentScale * perUnit,
    '--total-scale-factor': textLayout.contentScale * perUnit,
    '--user-unit': 1,
  } as React.CSSProperties) : undefined;

  return (
    <div ref={hostRef} className="pdf-js-page" aria-label={`Page ${pageNumber}`} data-page={pageNumber} style={{ width: cssWidth, height: cssHeight }}>
      {!rendered && <div className="pdf-js-page-placeholder"><span>Page {pageNumber}</span></div>}
      <canvas ref={canvasRef} className={rendered ? 'is-rendered' : ''} />
      <canvas ref={hiCanvasRef} className="pdf-js-hires" aria-hidden="true" />
      <div className="pdf-js-text-wrap" style={textStyle}><div ref={textRef} className="pdf-js-text" /></div>
    </div>
  );
});

export default function PdfViewerModal({ resource, onClose }: Props) {
  const [pdf, setPdf] = useState<any>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [fitScale, setFitScale] = useState(0.7);
  const [fitScaleReady, setFitScaleReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(INITIAL_READER_ZOOM);
  const [settledZoom, setSettledZoom] = useState(INITIAL_READER_ZOOM);
  const zoomRef = useRef(INITIAL_READER_ZOOM);
  const anchorRef = useRef<ZoomAnchor | null>(null);
  const fullscreenRef = useRef(false);
  const chromeTimerRef = useRef<number | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Page position
  const [currentPage, setCurrentPage] = useState(1);
  const currentPageRef = useRef(1);
  const [pageDraft, setPageDraft] = useState<string | null>(null);
  const restoreRef = useRef<{ page: number } | null>(null);
  const restoredRef = useRef(false);
  const [resumedAt, setResumedAt] = useState<number | null>(null);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const searchOpenRef = useRef(false);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const textIndexRef = useRef<string[][]>([]);
  const [indexVersion, setIndexVersion] = useState(0);
  const [indexedPages, setIndexedPages] = useState(0);
  const [activeMatch, setActiveMatch] = useState(0);
  const [focusToken, setFocusToken] = useState(0);
  const pendingFocusRef = useRef(false);

  // Night reading + saved copy
  const [night, setNight] = useState(() => getNightMode());
  const [offlineState, setOfflineState] = useState<'none' | 'saving' | 'saved'>('none');
  const [offlineProgress, setOfflineProgress] = useState(0);

  const fullscreen = nativeFullscreen || pseudoFullscreen;
  fullscreenRef.current = fullscreen;

  /** Zoom while keeping the content under the fingers / cursor in place. */
  const applyZoom = useCallback((value: number, focal?: Focal, previousFocal?: Focal) => {
    const bounded = Math.min(MAX_READER_ZOOM, Math.max(MIN_READER_ZOOM, value));
    const old = zoomRef.current;
    const stage = stageRef.current;
    if (Math.abs(bounded - old) < 0.0005) return;
    if (stage) {
      const rect = stage.getBoundingClientRect();
      const f1 = focal ? { x: focal.x - rect.left, y: focal.y - rect.top } : { x: stage.clientWidth / 2, y: stage.clientHeight / 2 };
      const f0 = previousFocal ? { x: previousFocal.x - rect.left, y: previousFocal.y - rect.top } : f1;
      const ratio = bounded / old;
      const pending = anchorRef.current;
      if (pending) { pending.ratio *= ratio; pending.x1 = f1.x; pending.y1 = f1.y; }
      else anchorRef.current = { ratio, x0: f0.x, y0: f0.y, x1: f1.x, y1: f1.y, sx: stage.scrollLeft, sy: stage.scrollTop };
    }
    zoomRef.current = bounded;
    setZoomLevel(bounded);
  }, []);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const stage = stageRef.current;
    anchorRef.current = null;
    if (!anchor || !stage) return;
    stage.scrollLeft = (anchor.sx + anchor.x0) * anchor.ratio - anchor.x1;
    stage.scrollTop = (anchor.sy + anchor.y0) * anchor.ratio - anchor.y1;
  }, [zoomLevel]);

  // Re-render sharp canvases only after zooming has paused.
  useEffect(() => {
    const timer = window.setTimeout(() => setSettledZoom(zoomLevel), 260);
    return () => window.clearTimeout(timer);
  }, [zoomLevel]);

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
    setFitScaleReady(false);

    // Continue where the student stopped: last page + zoom for this resource.
    const saved = getReaderProgress(resource.id);
    const startZoom = saved ? clamp(Number(saved.zoom) || INITIAL_READER_ZOOM, MIN_READER_ZOOM, MAX_READER_ZOOM) : INITIAL_READER_ZOOM;
    zoomRef.current = startZoom;
    setZoomLevel(startZoom);
    setSettledZoom(startZoom);
    restoreRef.current = saved && saved.page > 1 ? { page: saved.page } : null;
    restoredRef.current = false;
    currentPageRef.current = 1;
    setCurrentPage(1);
    setResumedAt(null);
    textIndexRef.current = [];
    setIndexVersion(0);
    setIndexedPages(0);
    addRecentlyViewed(resource);

    let loadedDoc: any = null;
    loadPdfDocument(fileUrl, fileKey, (loaded, total) => {
      if (total > 0 && !cancelled) setLoadProgress(Math.max(1, Math.min(99, Math.round((loaded / total) * 100))));
    }).then((document) => {
      loadedDoc = document;
      if (cancelled) { releasePdfDocument(fileKey, document); return; }
      setPdf(document);
      setPageCount(document.numPages);
      setLoadProgress(100);
      setLoading(false);
    }).catch((error) => {
      console.error('[pdf-reader]', error);
      if (!cancelled) { setLoading(false); setFailed(true); }
    });

    return () => { cancelled = true; if (loadedDoc) releasePdfDocument(fileKey, loadedDoc); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource?.id, fileUrl, fileKey, isImage]);

  const ready = Boolean(pdf) && !loading && !failed && fitScaleReady && !isImage;

  // ---- Where am I? Measures real page positions so it stays correct at any zoom.
  const getMetrics = useCallback(() => {
    const stage = stageRef.current;
    const pages = pagesRef.current;
    if (!stage || !pages || !pages.children.length) return null;
    const stageTop = stage.getBoundingClientRect().top;
    const first = (pages.children[0] as HTMLElement).getBoundingClientRect();
    const pitch = pages.children.length > 1 ? (pages.children[1] as HTMLElement).getBoundingClientRect().top - first.top : first.height;
    return { stage, top0: first.top - stageTop + stage.scrollTop, pitch: Math.max(1, pitch) };
  }, []);

  const jumpToPage = useCallback((value: number) => {
    const metrics = getMetrics();
    if (!metrics || !pageCount) return;
    const page = clamp(Math.round(value) || 1, 1, pageCount);
    metrics.stage.scrollTop = Math.max(0, metrics.top0 + (page - 1) * metrics.pitch - 8);
    currentPageRef.current = page;
    setCurrentPage(page);
  }, [getMetrics, pageCount]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!ready || !stage) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const metrics = getMetrics();
      if (!metrics) return;
      const probe = stage.scrollTop + stage.clientHeight * 0.4;
      const page = clamp(Math.floor((probe - metrics.top0) / metrics.pitch) + 1, 1, pageCount);
      if (page !== currentPageRef.current) { currentPageRef.current = page; setCurrentPage(page); }
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    stage.addEventListener('scroll', onScroll, { passive: true });
    if (restoredRef.current) update();
    return () => { if (frame) window.cancelAnimationFrame(frame); stage.removeEventListener('scroll', onScroll); };
  }, [ready, pageCount, getMetrics, zoomLevel, fitScale]);

  // Restore the saved page once the page boxes exist (their heights are known, so one jump is exact).
  useLayoutEffect(() => {
    if (!ready || restoredRef.current) return;
    restoredRef.current = true;
    const target = restoreRef.current;
    restoreRef.current = null;
    if (target && target.page > 1) {
      jumpToPage(target.page);
      setResumedAt(clamp(target.page, 1, pageCount));
    }
  }, [ready, jumpToPage, pageCount]);

  useEffect(() => {
    if (resumedAt === null) return;
    const timer = window.setTimeout(() => setResumedAt(null), 7000);
    return () => window.clearTimeout(timer);
  }, [resumedAt]);

  // Save page + zoom (debounced, and flushed when the reader closes).
  const latestProgressRef = useRef<{ id: number; page: number; zoom: number; pages: number } | null>(null);
  useEffect(() => {
    if (!resource || !ready || !restoredRef.current) return;
    const snapshot = { id: resource.id, page: currentPage, zoom: Math.round(zoomLevel * 100) / 100, pages: pageCount };
    latestProgressRef.current = snapshot;
    const timer = window.setTimeout(() => saveReaderProgress(snapshot.id, snapshot), 400);
    return () => window.clearTimeout(timer);
  }, [resource, ready, currentPage, zoomLevel, pageCount]);
  useEffect(() => () => {
    const snapshot = latestProgressRef.current;
    if (snapshot) saveReaderProgress(snapshot.id, snapshot);
  }, [resource?.id]);

  // ---- Search: index text lazily the first time search opens.
  const openSearch = useCallback(() => {
    searchOpenRef.current = true;
    setSearchOpen(true);
    window.setTimeout(() => { searchInputRef.current?.focus(); searchInputRef.current?.select(); }, 30);
  }, []);
  const closeSearch = useCallback(() => {
    searchOpenRef.current = false;
    setSearchOpen(false);
    setSearchInput('');
    setQuery('');
  }, []);

  useEffect(() => {
    if (!searchOpen || !pdf || !pageCount || textIndexRef.current.length >= pageCount) return;
    let cancelled = false;
    (async () => {
      for (let index = textIndexRef.current.length; index < pageCount; index += 1) {
        if (cancelled) return;
        try {
          const page = await pdf.getPage(index + 1);
          const content = await page.getTextContent();
          textIndexRef.current[index] = (content.items as Array<{ str?: string }>).map((item) => item.str ?? '').filter((text) => text.length > 0);
        } catch { textIndexRef.current[index] = []; }
        if ((index + 1) % 4 === 0 || index + 1 === pageCount) { setIndexedPages(index + 1); setIndexVersion((v) => v + 1); }
      }
    })();
    return () => { cancelled = true; };
  }, [searchOpen, pdf, pageCount]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim();
      setQuery(next.length >= 2 ? next : '');
      pendingFocusRef.current = true;
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const matches = useMemo(() => {
    if (!query) return [] as { page: number; ordinal: number }[];
    const found: { page: number; ordinal: number }[] = [];
    textIndexRef.current.forEach((items, pageIndex) => {
      if (!items) return;
      const count = countMatches(items, query);
      for (let ordinal = 0; ordinal < count && found.length < 3000; ordinal += 1) found.push({ page: pageIndex + 1, ordinal });
    });
    return found;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, indexVersion]);

  const goToMatch = useCallback((index: number) => {
    if (!matches.length) return;
    const wrapped = (index + matches.length) % matches.length;
    setActiveMatch(wrapped);
    jumpToPage(matches[wrapped].page);
    setFocusToken((token) => token + 1);
  }, [matches, jumpToPage]);

  // A new query jumps to its first hit as soon as one exists.
  useEffect(() => {
    if (!query || !matches.length || !pendingFocusRef.current) return;
    pendingFocusRef.current = false;
    goToMatch(0);
  }, [query, matches, goToMatch]);

  const activeHit = matches[activeMatch];
  const allIndexed = pageCount > 0 && indexedPages >= pageCount;
  const noTextAtAll = allIndexed && textIndexRef.current.every((items) => !items || items.length === 0);
  const searchStatus = !query ? (searchInput.trim().length === 1 ? 'Type 2+ letters' : '')
    : matches.length ? `${Math.min(activeMatch + 1, matches.length)} of ${matches.length}${allIndexed ? '' : '+'}`
    : noTextAtAll ? 'Scanned note: no text to search'
    : allIndexed ? 'No matches' : 'Searching…';

  // ---- Night reading
  const toggleNight = useCallback(() => { setNight((on) => { setNightMode(!on); return !on; }); }, []);

  // ---- Offline reading
  useEffect(() => {
    let cancelled = false;
    setOfflineState('none');
    if (!fileKey || isImage || !offlineSupported()) return;
    hasOfflinePdf(fileKey).then((has) => { if (!cancelled && has) setOfflineState('saved'); });
    return () => { cancelled = true; };
  }, [fileKey, isImage]);

  const toggleOffline = useCallback(async () => {
    if (!resource || offlineState === 'saving') return;
    if (offlineState === 'saved') {
      await removeOfflinePdf(resource.id);
      setOfflineState('none');
      showToast('Removed from saved. It will load normally next time.', 'info');
      return;
    }
    setOfflineState('saving');
    setOfflineProgress(0);
    try {
      await saveOfflinePdf({ id: resource.id, title: resource.title, fileKey, url: fileUrl, pageUrl: `/resource/${resource.slug || resource.id}` }, setOfflineProgress);
      setOfflineState('saved');
      showToast('Saved. It will load faster next time.', 'success');
    } catch {
      setOfflineState('none');
      showToast('Could not save this note. Check your connection and storage.', 'error');
    }
  }, [resource, offlineState, fileKey, fileUrl, showToast]);

  // Chrome (header) visibility in fullscreen.
  const showChrome = useCallback((autoHide: boolean) => {
    setChromeHidden(false);
    if (chromeTimerRef.current) window.clearTimeout(chromeTimerRef.current);
    chromeTimerRef.current = null;
    if (autoHide && fullscreenRef.current) {
      chromeTimerRef.current = window.setTimeout(() => setChromeHidden(true), CHROME_HIDE_DELAY);
    }
  }, []);

  useEffect(() => {
    if (fullscreen) showChrome(true);
    else { if (chromeTimerRef.current) window.clearTimeout(chromeTimerRef.current); setChromeHidden(false); }
    return () => { if (chromeTimerRef.current) window.clearTimeout(chromeTimerRef.current); };
  }, [fullscreen, showChrome]);

  // Pinch-to-zoom, double-tap, trackpad pinch (ctrl+wheel). The stage allows native panning only.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || isImage) return;
    let pinching = false;
    let startDistance = 0;
    let startZoom = zoomRef.current;
    let lastMid: Focal = { x: 0, y: 0 };
    let pendingZoom = zoomRef.current;
    let pendingMid: Focal = lastMid;
    let frame = 0;
    let tapStart: { x: number; y: number; at: number; moved: boolean } | null = null;
    let lastTap: { x: number; y: number; at: number } | null = null;
    let singleTapTimer = 0;

    const distance = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const midpoint = (t: TouchList): Focal => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });
    const flush = () => {
      frame = 0;
      applyZoom(pendingZoom, pendingMid, lastMid);
      lastMid = pendingMid;
    };
    const onTouchStart = (event: TouchEvent) => {
      if ((event.target as Element | null)?.closest('button,a')) return;
      if (event.touches.length === 1) {
        const t = event.touches[0];
        tapStart = { x: t.clientX, y: t.clientY, at: performance.now(), moved: false };
      } else if (event.touches.length === 2) {
        tapStart = null;
        pinching = true;
        startDistance = Math.max(1, distance(event.touches));
        startZoom = zoomRef.current;
        pendingZoom = startZoom;
        lastMid = midpoint(event.touches);
        pendingMid = lastMid;
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && tapStart) {
        const t = event.touches[0];
        if (Math.hypot(t.clientX - tapStart.x, t.clientY - tapStart.y) > 10) tapStart.moved = true;
        return;
      }
      if (!pinching || event.touches.length !== 2) return;
      if (event.cancelable) event.preventDefault();
      pendingZoom = Math.min(MAX_READER_ZOOM, Math.max(MIN_READER_ZOOM, startZoom * (distance(event.touches) / startDistance)));
      pendingMid = midpoint(event.touches);
      if (!frame) frame = window.requestAnimationFrame(flush);
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (pinching && event.touches.length < 2) {
        pinching = false;
        if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
        applyZoom(pendingZoom, pendingMid, lastMid);
        tapStart = null;
        return;
      }
      if (event.touches.length !== 0 || !tapStart) return;
      const ended = event.changedTouches[0];
      const tap = tapStart;
      tapStart = null;
      if (!ended || tap.moved || performance.now() - tap.at > 320) return;
      const now = performance.now();
      if (lastTap && now - lastTap.at < 320 && Math.hypot(ended.clientX - lastTap.x, ended.clientY - lastTap.y) < 40) {
        window.clearTimeout(singleTapTimer);
        lastTap = null;
        const focal = { x: ended.clientX, y: ended.clientY };
        applyZoom(zoomRef.current > INITIAL_READER_ZOOM + 0.05 ? INITIAL_READER_ZOOM : DOUBLE_TAP_ZOOM, focal);
      } else {
        lastTap = { x: ended.clientX, y: ended.clientY, at: now };
        singleTapTimer = window.setTimeout(() => {
          if (fullscreenRef.current) setChromeHidden((hidden) => !hidden);
        }, 330);
      }
    };
    const onGesture = (event: Event) => { if (event.cancelable) event.preventDefault(); }; // stop Safari's native page zoom
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      applyZoom(zoomRef.current * Math.exp(-event.deltaY * 0.012), { x: event.clientX, y: event.clientY });
    };
    const onMouseMove = () => { if (fullscreenRef.current) showChrome(true); };

    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: false });
    stage.addEventListener('touchend', onTouchEnd, { passive: true });
    stage.addEventListener('touchcancel', onTouchEnd, { passive: true });
    stage.addEventListener('gesturestart', onGesture, { passive: false });
    stage.addEventListener('gesturechange', onGesture, { passive: false });
    stage.addEventListener('gestureend', onGesture, { passive: false });
    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(singleTapTimer);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', onTouchEnd);
      stage.removeEventListener('touchcancel', onTouchEnd);
      stage.removeEventListener('gesturestart', onGesture);
      stage.removeEventListener('gesturechange', onGesture);
      stage.removeEventListener('gestureend', onGesture);
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('mousemove', onMouseMove);
    };
  }, [isImage, applyZoom, showChrome, loading, failed]);

  // Fit pages to the available width.
  useLayoutEffect(() => {
    if (!pdf || isImage || !stageRef.current) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled || !stageRef.current) return;
      const stage = stageRef.current;
      const styles = window.getComputedStyle(stage);
      const horizontalPadding = (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
      const availableWidth = Math.max(1, stage.clientWidth - horizontalPadding - 2);
      setFitScale(Math.max(0.1, Math.min(1.6, availableWidth / A4_WIDTH)));
      setFitScaleReady(true);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stageRef.current);
    return () => { cancelled = true; observer.disconnect(); };
  }, [pdf, isImage, fullscreen, fitScaleReady]);

  const exitFullscreen = useCallback(async () => {
    const doc = document as any;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (doc.webkitFullscreenElement) await doc.webkitExitFullscreen?.();
    } catch { /* ignore */ }
    setPseudoFullscreen(false);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (fullscreenRef.current) { await exitFullscreen(); return; }
    const target = shellRef.current as any;
    const request = target?.requestFullscreen || target?.webkitRequestFullscreen;
    if (request) {
      try { await request.call(target); return; } catch { /* fall through to in-page fullscreen */ }
    }
    // iPhone Safari and some in-app browsers can't fullscreen a div: fill the screen ourselves.
    setPseudoFullscreen(true);
  }, [exitFullscreen]);

  useEffect(() => {
    if (!resource) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onFullscreenChange = () => {
      const doc = document as any;
      setNativeFullscreen(Boolean(document.fullscreenElement || doc.webkitFullscreenElement));
    };
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f' && !isImage) { event.preventDefault(); openSearch(); return; }
      if (event.key === 'Escape') {
        if (searchOpenRef.current) { closeSearch(); return; }
        if (fullscreenRef.current && !document.fullscreenElement) setPseudoFullscreen(false);
        else if (!document.fullscreenElement) onClose();
        return;
      }
      if (!(event.ctrlKey || event.metaKey) || isImage) return;
      if (event.key === '+' || event.key === '=') { event.preventDefault(); applyZoom(zoomRef.current + READER_ZOOM_STEP); }
      else if (event.key === '-') { event.preventDefault(); applyZoom(zoomRef.current - READER_ZOOM_STEP); }
      else if (event.key === '0') { event.preventDefault(); applyZoom(INITIAL_READER_ZOOM); }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', onKey);
      const doc = document as any;
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      else if (doc.webkitFullscreenElement) doc.webkitExitFullscreen?.();
      setPseudoFullscreen(false);
    };
  }, [resource, onClose, applyZoom, isImage, openSearch, closeSearch]);

  if (!resource) return null;

  const shellClass = `pdf-reader-shell${fullscreen ? ' is-fullscreen' : ''}${fullscreen && chromeHidden ? ' chrome-hidden' : ''}${night && !isImage ? ' is-night' : ''}`;
  const commitPage = () => {
    if (pageDraft !== null && pageDraft.trim() !== '') jumpToPage(Number(pageDraft));
    setPageDraft(null);
  };

  return (
    <div ref={shellRef} className={shellClass} role="dialog" aria-modal="true" aria-label={`Reading ${resource.title}`}>
      <section className="pdf-reader-window">
        <header className="pdf-reader-header">
          <div className="pdf-reader-title">
            <div className="pdf-reader-file-icon"><FileText /></div>
            <div className="min-w-0"><strong>{resource.title}</strong><span>Class {resource.class_level} · {resource.subject}{pageCount ? ` · ${pageCount} pages` : ''}</span></div>
          </div>
          <div className="pdf-reader-actions">
            {!isImage && <>
              <button type="button" className={searchOpen ? 'is-active' : ''} onClick={() => (searchOpen ? closeSearch() : openSearch())} aria-label="Search in this note" aria-pressed={searchOpen} title="Search (Ctrl+F)"><Search /></button>
              <button type="button" className={night ? 'is-active' : ''} onClick={toggleNight} aria-label={night ? 'Switch to day reading' : 'Switch to night reading'} aria-pressed={night} title={night ? 'Day mode' : 'Night mode'}>{night ? <Sun /> : <Moon />}</button>
              {offlineSupported() && (
                <button type="button" className={`pdf-offline-btn${offlineState === 'saved' ? ' is-active' : ''}`} onClick={toggleOffline} disabled={offlineState === 'saving'} aria-label={offlineState === 'saved' ? 'Remove saved copy' : 'Save so it loads faster next time'} title={offlineState === 'saved' ? 'Saved. Loads faster next time. Tap to remove' : offlineState === 'saving' ? `Saving ${offlineProgress}%` : 'Save. Next time it will load faster'}>
                  {offlineState === 'saving' ? <span className="pdf-offline-pct">{offlineProgress}%</span> : offlineState === 'saved' ? <Check /> : <HardDriveDownload />}
                </button>
              )}
              <button type="button" className="pdf-zoom-btn" onClick={() => applyZoom(zoomRef.current - READER_ZOOM_STEP)} disabled={zoomLevel <= MIN_READER_ZOOM} aria-label="Zoom out"><Minus /></button>
              <button type="button" className="pdf-reader-zoom" onClick={() => applyZoom(INITIAL_READER_ZOOM)} aria-label="Reset zoom" title="Reset zoom">{Math.round(zoomLevel * 100)}%</button>
              <button type="button" className="pdf-zoom-btn" onClick={() => applyZoom(zoomRef.current + READER_ZOOM_STEP)} disabled={zoomLevel >= MAX_READER_ZOOM} aria-label="Zoom in"><Plus /></button>
            </>}
            <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>{fullscreen ? <Minimize2 /> : <Maximize2 />}</button>
            <a href={fileUrl} download={resource.file_name || resource.title} aria-label="Download"><Download /></a>
            <button type="button" onClick={() => { if (fullscreenRef.current) void exitFullscreen(); onClose(); }} aria-label="Close reader"><X /></button>
          </div>
        </header>
        <main ref={stageRef} className="pdf-reader-stage" aria-busy={loading && !isImage && !failed}>
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
            <div ref={pagesRef} className="pdf-reader-pages">
              {Array.from({ length: pageCount }, (_, index) => (
                <PdfPage key={`${fileKey}-${index + 1}`} pdf={pdf} pageNumber={index + 1} fileKey={fileKey} displayScale={fitScale} zoomLevel={zoomLevel} settledZoom={settledZoom} stageRef={stageRef}
                  query={searchOpen ? query : ''} activeOrdinal={activeHit && activeHit.page === index + 1 ? activeHit.ordinal : -1} focusToken={focusToken} />
              ))}
            </div>
          )}
        </main>
        {searchOpen && !isImage && (
          <div className="pdf-reader-search" role="search">
            <Search className="pdf-search-icon" />
            <input ref={searchInputRef} type="search" value={searchInput} placeholder="Search in this note" aria-label="Search in this note" autoComplete="off" spellCheck={false}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); goToMatch(activeMatch + (event.shiftKey ? -1 : 1)); } }} />
            <span className="pdf-search-status" aria-live="polite">{searchStatus}</span>
            <button type="button" onClick={() => goToMatch(activeMatch - 1)} disabled={!matches.length} aria-label="Previous match"><ChevronUp /></button>
            <button type="button" onClick={() => goToMatch(activeMatch + 1)} disabled={!matches.length} aria-label="Next match"><ChevronDown /></button>
            <button type="button" onClick={closeSearch} aria-label="Close search"><X /></button>
          </div>
        )}
        {ready && pageCount > 0 && (
          <div className="pdf-reader-pager">
            {resumedAt !== null && (
              <div className="pdf-resume-chip" role="status">Continued from page {resumedAt}<button type="button" onClick={() => { jumpToPage(1); setResumedAt(null); }}>Start over</button></div>
            )}
            <div className="pdf-pager-pill">
              <button type="button" onClick={() => jumpToPage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page"><ChevronLeft /></button>
              <label className="pdf-pager-label">
                <span>Page</span>
                <input type="text" inputMode="numeric" pattern="[0-9]*" aria-label="Jump to page" value={pageDraft ?? String(currentPage)}
                  onFocus={(event) => { setPageDraft(String(currentPage)); event.currentTarget.select(); }}
                  onChange={(event) => setPageDraft(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  onBlur={commitPage}
                  onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commitPage(); event.currentTarget.blur(); } else if (event.key === 'Escape') { event.stopPropagation(); setPageDraft(null); event.currentTarget.blur(); } }} />
                <span>/ {pageCount}</span>
              </label>
              <button type="button" onClick={() => jumpToPage(currentPage + 1)} disabled={currentPage >= pageCount} aria-label="Next page"><ChevronRight /></button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
