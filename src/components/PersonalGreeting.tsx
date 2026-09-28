'use client';
import React from 'react';
import { useStudentClass } from './StudentClassContext';

export default function PersonalGreeting({ activeClass }: { activeClass: number }) {
  const { displayName } = useStudentClass();
  const name = displayName.trim();
  return (
    <div className="hero-greeting" aria-live="polite">
      {name ? <>Hello, <strong>{name}</strong>.</> : <>Hello.</>}
      <span className="block mt-2 text-sm sm:text-base font-medium" style={{ color: 'var(--hero-muted)', letterSpacing: '-.01em' }}>
        Class {activeClass} · notes, papers, tips and useful material in one place.
      </span>
    </div>
  );
}
