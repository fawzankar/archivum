'use client';

import { useEffect, useState } from 'react';

export default function LibraryLoading({ label }: { label: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = performance.now();
    const id = window.setInterval(() => {
      setElapsed((performance.now() - started) / 1000);
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="library-loading-screen" role="status" aria-live="polite">
      <div className="library-loading-card">
        <div className="library-loading-spinner" />
        <strong>{label}</strong>
        <span>{elapsed.toFixed(1)}s</span>
        <div className="library-loading-bar"><i /></div>
      </div>
    </div>
  );
}
