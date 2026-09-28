'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] grid place-items-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">ARCHIVUM</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">Something went wrong.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">The archive hit a temporary server problem. Try the page again; your saved profile and preferences are still on this device.</p>
        <div className="mt-7 flex justify-center gap-3">
          <button type="button" onClick={() => reset()} className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">Try again</button>
          <a href="/" className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold">Home</a>
        </div>
        {error.digest && <p className="mt-6 text-[11px] text-[var(--ink-faint)]">Reference: {error.digest}</p>}
      </div>
    </main>
  );
}
