'use client';

import { LoaderCircle } from 'lucide-react';
import { useStudentClass } from './StudentClassContext';

export default function ClassTransitionOverlay() {
  const { isChangingClass } = useStudentClass();
  if (!isChangingClass) return null;
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center"
      style={{ background: 'color-mix(in srgb,var(--ivory) 58%, transparent)', backdropFilter: 'blur(18px) saturate(1.15)' }}>
      <div className="flex items-center gap-3 rounded-full border px-5 py-3 shadow-2xl animate-soft-scale"
        style={{ background: 'color-mix(in srgb,var(--surface) 88%,transparent)', borderColor:'var(--border)' }}>
        <LoaderCircle className="w-4 h-4 animate-spin" style={{color:'var(--accent)'}} />
        <span className="text-xs font-bold">Updating your class archive…</span>
      </div>
    </div>
  );
}
