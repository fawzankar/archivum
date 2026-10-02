import React from 'react';

export const metadata = {
  title: 'Privacy Policy | ARCHIVUM',
  description: 'How ARCHIVUM handles your data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          YOUR DATA
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
          <strong className="text-zinc-900 dark:text-zinc-100">ARCHIVUM</strong> collects as little as it can. You shouldn’t have to be tracked just to read your notes.
        </p>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">1. No profiles</h3>
          <p>We don’t collect names, phone numbers or passwords from students who browse, read or download notes and papers.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">2. Stored on your device</h3>
          <p>Your saved items and recently viewed list stay in your browser’s local storage. They are never uploaded to our servers.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">3. Counters</h3>
          <p>Download counts and star ratings use a random, anonymous token saved on your device, so one person can’t vote twice. It isn’t tied to who you are.</p>
        </div>
      </div>
    </div>
  );
}
