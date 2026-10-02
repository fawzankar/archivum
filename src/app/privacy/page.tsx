import React from 'react';

export const metadata = {
  title: 'Privacy Policy | ARCHIVUM',
  description: 'How ARCHIVUM treats your data: very carefully, and very little of it.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          YOUR PRIVACY
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
          <strong className="text-zinc-900 dark:text-zinc-100">ARCHIVUM</strong> collects as little about you as possible. Students should be able to study without being tracked.
        </p>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">1. We don’t profile you</h3>
          <p>If you’re just browsing, reading or downloading, we don’t ask for your name, phone number or a password.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">2. Your stuff stays on your device</h3>
          <p>Your saved items, recently opened files, study streak, daily goal, exam countdown, focus time and recent searches all live in your browser. None of it is sent to us.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">3. Anonymous counters</h3>
          <p>Download counts and star ratings use a random token stored on your device. It stops double voting and doesn’t say anything about who you are.</p>
        </div>
      </div>
    </div>
  );
}
