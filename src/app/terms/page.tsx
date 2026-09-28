import React from 'react';

export const metadata = {
  title: 'Terms of Service — ARCHIVUM',
  description: 'Terms of Service and educational usage guidelines for ARCHIVUM.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {}
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          LEGAL & POLICY
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
          Welcome to <strong className="text-zinc-900 dark:text-zinc-100">ARCHIVUM</strong>. By accessing or using this platform, you agree to these straightforward student guidelines.
        </p>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">1. Educational Purpose</h3>
          <p>ARCHIVUM is operated purely for high-school academic study and revision purposes for students of Classes 9, 10, 11, and 12.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">2. Student Submissions</h3>
          <p>By submitting academic notes or previous examination papers, you confirm that you have permission to share the material. Administrators maintain full discretion to approve, edit metadata for clarity, reject, or remove any submission.</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">3. Verification Notice</h3>
          <p>The &ldquo;✓ Verified&rdquo; label signifies that an administrator checked the file for readability, syllabus relevance, and absence of duplication.</p>
        </div>
      </div>
    </div>
  );
}
