import React from 'react';

export const metadata = {
  title: 'Content Guidelines — ARCHIVUM',
  description: 'Submission guidelines for academic materials on ARCHIVUM.',
};

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {}
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          COMMUNITY STANDARDS
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Content Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Requirements and quality benchmarks for publishing study materials on ARCHIVUM.
        </p>
      </div>

      <div
        className="rounded-3xl border p-6 sm:p-8 space-y-6 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Before submitting academic material to ARCHIVUM, please ensure your contribution satisfies these standards:
        </p>

        <ul className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Target Audience:</strong> Must be specifically relevant to students of Classes 9, 10, 11, or 12.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Accurate Classification:</strong> Correctly specify the academic class, subject, and chapter or paper category.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Legibility:</strong> Scans and PDFs must be clear, readable, upright, and without significant cut-offs or blurriness.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>School Identification:</strong> For school examinations (pre-boards, unit tests), please provide the full school name and exam year.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Permissions:</strong> Do not upload commercial copyrighted textbooks or paid digital courses.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
