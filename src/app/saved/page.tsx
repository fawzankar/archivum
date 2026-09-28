import React from 'react';
import SavedClient from './SavedClient';

export const metadata = {
  title: 'My Saved Resources — ARCHIVUM',
  description: 'View your device-saved notes, board papers, and study resources.',
};

export default function SavedPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          OFFLINE CACHE & BOOKMARKS
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Saved Resources
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
          Your personal collection of saved notes and examination papers stored locally on this device.
        </p>
      </div>

      <SavedClient />
    </div>
  );
}
