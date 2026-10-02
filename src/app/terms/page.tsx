import React from 'react';

export const metadata = {
  title: 'Terms of Service | ARCHIVUM',
  description: 'The ground rules for using ARCHIVUM.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          THE RULES
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Terms of Service
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
          By using <strong className="text-zinc-900 dark:text-zinc-100">ARCHIVUM</strong> you agree to the points below. They’re short on purpose.
        </p>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">1. What it’s for</h3>
          <p>ARCHIVUM exists for study and revision by students in Classes 9, 10, 11 and 12.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">2. What you upload</h3>
          <p>When you submit notes or papers, you’re confirming you have permission to share them. Admins can approve, reject or remove any submission, and may edit the details (title, subject and so on) to make it clearer.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">3. The Verified label</h3>
          <p>&ldquo;✓ Verified&rdquo; means an admin checked that the file is readable, fits the syllabus and isn’t a duplicate.</p>
        </div>
      </div>
    </div>
  );
}
