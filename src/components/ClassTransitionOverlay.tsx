'use client';

import { LoaderCircle } from 'lucide-react';
import { useStudentClass } from './StudentClassContext';

export default function ClassTransitionOverlay() {
  const { isChangingClass } = useStudentClass();
  if (!isChangingClass) return null;
  return (
    <div className="fixed inset-0 z-[9990] pointer-events-none flex items-center justify-center"
      style={{ background: 'color-mix(in srgb,var(--ivory) 18%, transparent)', backdropFilter: 'blur(3px)' }}>
      <div className="flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg animate-soft-scale opacity-80"
        style={{ background: 'color-mix(in srgb,var(--surface) 88%,transparent)', borderColor:'var(--border)' }}>
        <LoaderCircle className="w-4 h-4 animate-spin" style={{color:'var(--accent)'}} />
        <span className="text-xs font-bold">Switching class…</span>
      </div>
    </div>
  );
}
