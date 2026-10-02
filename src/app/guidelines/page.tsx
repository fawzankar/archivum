import React from 'react';

export const metadata = {
  title: 'Sharing guidelines | ARCHIVUM',
  description: 'What to keep in mind before you share material on ARCHIVUM.',
};

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          BEFORE YOU SHARE
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Sharing guidelines
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          A few simple things that keep the archive useful for everyone.
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
          Thanks for wanting to share! Please check these before you submit:
        </p>

        <ul className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Right audience:</strong> It should help students in Classes 9 to 12.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Tag it properly:</strong> Pick the right class, subject and chapter or paper type.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Easy to read:</strong> Scans should be sharp, upright and not cut off.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Name the school:</strong> For pre-boards and unit tests, add the school’s full name and the year.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--sage)' }} />
            <span><strong>Only what you can share:</strong> Please don’t upload commercial textbooks or paid courses.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
