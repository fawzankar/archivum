'use client';

import React from 'react';
import { Resource } from '@/lib/resources';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

interface PdfViewerModalProps {
  resource: Resource | null;
  onClose: () => void;
}

export default function PdfViewerModal({ resource, onClose }: PdfViewerModalProps) {
  if (!resource) return null;

  const isImage = resource.file_type?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(resource.file_name || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade">
      <div
        className="rounded-3xl border w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="p-4 sm:p-5 border-b flex items-center justify-between gap-4"
          style={{
            borderColor: 'var(--border-light)',
            backgroundColor: 'var(--surface-raised)',
          }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-800">
              <FileText className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="truncate">
              <h3 className="font-display font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                {resource.title}
              </h3>
              <p className="text-[11px] text-zinc-500">
                Class {resource.class_level} · {resource.subject} · {resource.resource_type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={resource.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-xs font-semibold rounded-full border hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </a>
            <a
              href={resource.file_url}
              download={resource.file_name || resource.title}
              className="px-4 py-2 text-xs font-semibold rounded-full text-white bg-zinc-900 hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={resource.file_url}
                alt={resource.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : (
            <iframe
              src={`${resource.file_url}#toolbar=0`}
              className="w-full h-full rounded-2xl border bg-white shadow-inner"
              style={{ borderColor: 'var(--border)' }}
              title={resource.title}
            />
          )}
        </div>
      </div>
    </div>
  );
}
