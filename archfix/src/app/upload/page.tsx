import React from 'react';
import UploadClient from './UploadClient';

export const metadata = {
  title: 'Upload Resource — ARCHIVUM',
  description: 'Share notes, papers and study materials with other SJS students. Every submission is reviewed before publication.',
};

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          CONTRIBUTE TO THE ARCHIVE
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Upload to ARCHIVUM
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
          Help fellow students find the notes and examination papers they need. Submissions are reviewed by our team before publishing.
        </p>
      </div>

      <UploadClient />
    </div>
  );
}
