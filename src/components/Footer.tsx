'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      className="border-t transition-colors mt-20 pb-20 md:pb-8"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--ivory)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left: Brand Monogram & Mission */}
        <div className="flex items-start gap-3.5 max-w-md">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs tracking-tight shrink-0 mt-0.5"
            style={{
              border: '1.5px solid var(--ink)',
              color: 'var(--ink)',
              backgroundColor: 'transparent',
            }}
          >
            SJS
          </div>
          <div className="space-y-1">
            <div className="flex flex-col">
              <span
                className="font-display font-bold tracking-tight text-sm leading-none"
                style={{ color: 'var(--ink)' }}
              >
                SJS CONNECT
              </span>
              <span
                className="text-[9px] font-sans font-medium tracking-wider uppercase mt-0.5"
                style={{ color: 'var(--ink-muted)' }}
              >
                FIND, STUDY, SHARE IT.
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              Built for students, by students. Free JKBOSE academic resources for Classes 9–12.
            </p>
          </div>
        </div>

        {/* Right: Clean Links (No CMS trace) */}
        <div className="flex flex-wrap items-center gap-5 sm:gap-6 text-xs font-medium">
          <Link
            href="/about"
            className="transition-colors hover:underline"
            style={{ color: 'var(--ink-muted)' }}
          >
            Our Story & Vision
          </Link>
          <Link
            href="/notes"
            className="transition-colors hover:underline"
            style={{ color: 'var(--ink-muted)' }}
          >
            Notes
          </Link>
          <Link
            href="/previous-papers"
            className="transition-colors hover:underline"
            style={{ color: 'var(--ink-muted)' }}
          >
            Papers
          </Link>
          <Link
            href="/guidelines"
            className="transition-colors hover:underline"
            style={{ color: 'var(--ink-muted)' }}
          >
            Guidelines
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:underline"
            style={{ color: 'var(--ink-muted)' }}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:underline"
            style={{ color: 'var(--ink-muted)' }}
          >
            Terms
          </Link>
        </div>

      </div>

      {/* Subtle bottom note */}
      <div
        className="border-t py-4 text-center text-[11px]"
        style={{
          borderColor: 'var(--border-light)',
          color: 'var(--ink-faint)',
        }}
      >
        © {new Date().getFullYear()} SJS CONNECT — Dedicated to every student preparing for examinations. • Made with care by Fawzan Kar.
      </div>
    </footer>
  );
}
