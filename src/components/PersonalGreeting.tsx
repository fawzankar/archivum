'use client';
import React from 'react';
import { useStudentClass } from './StudentClassContext';

export default function PersonalGreeting({ activeClass }: { activeClass: number }) {
  const { displayName } = useStudentClass();
  const name = displayName.trim();
  return (
    <p className="hero-greeting" aria-live="polite">
      {name ? <>Hello, <strong>{name}</strong>. Your Class {activeClass} desk is ready.</> : <>Welcome back. Your Class {activeClass} desk is ready.</>}
    </p>
  );
}
