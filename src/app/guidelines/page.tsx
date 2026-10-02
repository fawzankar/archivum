import React from 'react';

export const metadata = {
  title: 'Upload Guidelines | ARCHIVUM',
  description: 'What to check before you upload notes or papers to ARCHIVUM.',
};

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          BEFORE YOU UPLOAD
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Upload guidelines
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          A few things to check before you send us something.
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
          Please run your upload through this list first:
        </p>

        <ul className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Right level:</strong> It should be useful to students in Classes 9 to 12.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Correct details:</strong> Pick the right class, subject, and chapter or paper type.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Readable scans:</strong> Pages should be sharp, upright and not cut off.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>School and year:</strong> For pre-boards and unit tests, add the full school name and the exam year.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Nothing paid:</strong> Please don’t upload commercial textbooks or paid courses.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
