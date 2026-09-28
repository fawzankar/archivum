import React from 'react';

export const metadata = {
  title: 'Privacy Policy — ARCHIVUM',
  description: 'Zero data tracking privacy policy of ARCHIVUM.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          DATA & PRIVACY
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-400">Last updated: September 2026</p>
      </div>

      <div
        className="rounded-3xl border p-6 sm:p-8 space-y-6 shadow-sm text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <p>
          <strong className="text-zinc-900 dark:text-zinc-100">ARCHIVUM</strong> adheres strictly to zero unnecessary data collection. We believe students should access school materials without tracking or invasive profiling.
        </p>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">1. Zero Student Profiling</h3>
          <p>We do not collect names, phone numbers, or passwords from students browsing, reading, or downloading notes and examination papers.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">2. Local Device Storage</h3>
          <p>Saved resources, recently viewed items, and dark/light mode preferences are held exclusively in your local browser storage and never uploaded to our servers.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">3. Anonymous Counters</h3>
          <p>Download tallies and star ratings employ anonymous, randomized session tokens stored on your device to protect against duplicate voting without tracking personal identity.</p>
        </div>
      </div>
    </div>
  );
}
