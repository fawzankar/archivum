'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Resource } from '@/lib/resources';
import { X, ExternalLink, Download, FileText, Maximize2, Minimize2, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { resource: Resource | null; onClose: () => void; }

export default function PdfViewerModal({ resource, onClose }: Props) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [retry, setRetry] = useState(0);

  const fileUrl = resource ? `/api/resources/${resource.id}/file` : '';
  const isImage = Boolean(resource && (resource.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(resource.file_name || '')));

  useEffect(() => {
    if (!resource) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, [resource]);

  useEffect(() => {
    if (!resource) return;
    setFailed(false);
    setLoading(!isImage);
  }, [resource?.id, isImage, retry]);

  useEffect(() => {
    if (!resource) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.fullscreenElement) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resource, onClose]);

  if (!resource) return null;

  const openOriginal = () => window.open(fileUrl, '_blank', 'noopener,noreferrer');

  const toggleFullscreen = async () => {
    const target = shellRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (target.requestFullscreen) await target.requestFullscreen();
    } catch {
      // Some mobile browsers do not expose fullscreen; the reader still fills the viewport.
    }
  };

  return (
    <div ref={shellRef} className="pdf-native-shell" role="dialog" aria-modal="true" aria-label={`Reading ${resource.title}`}>
      <button className="pdf-native-backdrop" onClick={onClose} aria-label="Close reader" />
      <section className="pdf-native-window">
        <header className="pdf-native-header">
          <div className="pdf-native-title">
            <div className="pdf-native-file-icon"><FileText /></div>
            <div className="min-w-0">
              <strong>{resource.title}</strong>
              <span>Class {resource.class_level} · {resource.subject}</span>
            </div>
          </div>
          <div className="pdf-native-actions">
            <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {fullscreen ? <Minimize2 /> : <Maximize2 />}
            </button>
            <button type="button" onClick={openOriginal} aria-label="Open in new tab" title="Open in new tab"><ExternalLink /></button>
            <a href={fileUrl} download={resource.file_name || resource.title} aria-label="Download" title="Download"><Download /></a>
            <button type="button" onClick={onClose} aria-label="Close reader" title="Close"><X /></button>
          </div>
        </header>

        <div className="pdf-native-stage">
          {isImage ? (
            <div className="pdf-native-image"><img src={fileUrl} alt={resource.title} /></div>
          ) : (
            <>
              {loading && !failed && <div className="pdf-native-loading"><Loader2 /><span>Opening document…</span></div>}
              {failed ? (
                <div className="pdf-native-error">
                  <AlertTriangle />
                  <strong>This document could not be opened.</strong>
                  <span>Try again or use the original file.</span>
                  <div>
                    <button type="button" onClick={() => setRetry(value => value + 1)}><RefreshCw /> Try again</button>
                    <button type="button" onClick={openOriginal}><ExternalLink /> Open file</button>
                  </div>
                </div>
              ) : (
                <iframe
                  key={`${resource.id}-${retry}`}
                  ref={iframeRef}
                  src={fileUrl}
                  title={resource.title}
                  className="pdf-native-frame"
                  allow="fullscreen"
                  onLoad={() => setLoading(false)}
                  onError={() => { setLoading(false); setFailed(true); }}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
