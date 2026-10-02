import React from 'react';

export const metadata = {
  title: 'Terms of Service | ARCHIVUM',
  description: 'The simple ground rules for using ARCHIVUM.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          THE GROUND RULES
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
          Welcome to <strong className="text-zinc-900 dark:text-zinc-100">ARCHIVUM</strong>. By using it, you’re agreeing to a few simple ground rules.
        </p>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">1. It’s for studying</h3>
          <p>ARCHIVUM exists to help students in Classes 9 to 12 study and revise. That’s all it’s for.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">2. When you share something</h3>
          <p>When you submit notes or papers, you’re telling us you’re allowed to share them. Our admins may approve, tidy up the details, reject or remove any submission.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">3. What “Verified” means</h3>
          <p>The &ldquo;✓ Verified&rdquo; label means an admin has checked that the file is readable, matches the syllabus and isn’t a duplicate.</p>
        </div>
      </div>
    </div>
  );
}
