import React from 'react';

export const metadata = { title: 'Terms of Service — ARCHIVUM' };

export default function TermsPage() {
  return (
    <div className="archive-shell">
      <div className="page-heading">
        <span className="eyebrow">Terms</span>
        <h1>Using ARCHIVUM responsibly.</h1>
        <p>Last updated: September 2026</p>
      </div>
      <div className="archive-surface page-section px-6 sm:px-10 space-y-8 text-sm leading-relaxed">
        <section><h2 className="text-xl font-semibold">Educational use</h2><p className="mt-2" style={{color:'var(--ink-muted)'}}>ARCHIVUM is intended to help students in Classes 9–12 find and share academic material for study and revision.</p></section>
        <section><h2 className="text-xl font-semibold">Student submissions</h2><p className="mt-2" style={{color:'var(--ink-muted)'}}>By submitting material, you confirm that you have the right or permission to share it. Moderators may approve, edit metadata for clarity, reject or remove a submission.</p></section>
        <section><h2 className="text-xl font-semibold">Accuracy</h2><p className="mt-2" style={{color:'var(--ink-muted)'}}>Archive resources are provided for study. Check important syllabus, timetable and examination information against official school or JKBOSE sources.</p></section>
        <section><h2 className="text-xl font-semibold">Removal</h2><p className="mt-2" style={{color:'var(--ink-muted)'}}>Material may be removed when it is duplicated, unsuitable, incorrectly categorised, or otherwise not appropriate for the archive.</p></section>
      </div>
    </div>
  );
}
