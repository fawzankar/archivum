'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Resource } from '@/lib/resources';
import { X, ExternalLink, Download, FileText, Loader2, Maximize2 } from 'lucide-react';

interface PdfViewerModalProps { resource: Resource | null; onClose: () => void; }

export default function PdfViewerModal({ resource, onClose }: PdfViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const fileUrl = useMemo(() => resource ? `/api/resources/${resource.id}/file` : '', [resource]);
  const isImage = Boolean(resource && (resource.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(resource.file_name || '')));

  useEffect(() => {
    if (!resource) return;
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 650);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', onKey); };
  }, [resource?.id, onClose]);

  if (!resource) return null;

  return (
    <div className={`pdf-reader-shell ${expanded ? 'is-expanded' : ''}`} role="dialog" aria-modal="true" aria-label={`Reading ${resource.title}`}>
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
            <button type="button" onClick={() => setExpanded(value => !value)} aria-label={expanded ? 'Exit full screen' : 'Expand reader'}><Maximize2 /></button>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" aria-label="Open document in a new tab"><ExternalLink /></a>
            <a href={fileUrl} download={resource.file_name || resource.title} aria-label="Download document"><Download /></a>
            <button type="button" onClick={onClose} aria-label="Close reader"><X /></button>
          </div>
        </header>

        <div className="pdf-reader-stage">
          {loading && <div className="pdf-reader-loading"><div className="pdf-reader-loading-card"><Loader2 className="animate-spin" /><strong>Opening document</strong><span>Your file is loading inside ARCHIVUM.</span></div></div>}
          <div className="pdf-reader-frame">
            {isImage ? (
              <img src={fileUrl} alt={resource.title} onLoad={() => setLoading(false)} onError={() => setLoading(false)} />
            ) : (
              <iframe key={resource.id} src={`${fileUrl}#page=1&view=FitH`} title={resource.title} onLoad={() => window.setTimeout(() => setLoading(false), 500)} />
            )}
          </div>
        </div>

        <footer className="pdf-reader-footer">
          <span>ESC to close</span>
          <span>{resource.file_name || 'document.pdf'}</span>
        </footer>
      </section>
    </div>
  );
}
