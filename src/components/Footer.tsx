'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return <footer className="mt-24 pb-24 md:pb-8 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
    <div className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-8 py-12 sm:py-16">
      <div className="grid lg:grid-cols-[1.4fr_.6fr] gap-12">
        <div>
          <div className="flex items-center gap-3"><span className="brand-logo w-10 h-10 flex items-center justify-center"><span aria-hidden="true" className="archivum-css-logo w-[76%] h-[76%]" /></span><div><div className="font-display text-lg tracking-[.12em]">ARCHIVUM</div><div className="brand-sister text-[8px] mt-1">Sister organisation of <span className="quest-word">QUEST</span></div></div></div>
          <p className="max-w-xl mt-5 text-sm leading-7" style={{ color: 'var(--ink-muted)' }}>Fawzan Kar started ARCHIVUM after finding it too easy for previous papers and useful quick notes to disappear when students needed them most. The idea is simple: keep the material in one place and make it easier for SJS students to pass it on.</p>
          <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--accent)' }}>Visit SJS QUEST <ArrowUpRight className="w-3.5 h-3.5" /></a>
        </div>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <Link href="/notes" style={{ color: 'var(--ink-muted)' }}>Notes</Link><Link href="/previous-papers" style={{ color: 'var(--ink-muted)' }}>Previous Papers</Link>
          <Link href="/tips" style={{ color: 'var(--ink-muted)' }}>Tips & Tricks</Link><Link href="/upload" style={{ color: 'var(--ink-muted)' }}>Upload</Link>
          <Link href="/about" style={{ color: 'var(--ink-muted)' }}>About Us</Link><Link href="/contributors" style={{ color: 'var(--ink-muted)' }}>Contributors</Link>
          <Link href="/guidelines" style={{ color: 'var(--ink-muted)' }}>Guidelines</Link><Link href="/privacy" style={{ color: 'var(--ink-muted)' }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'var(--ink-muted)' }}>Terms</Link>
        </div>
      </div>
      <div className="mt-12 pt-5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--ink-faint)' }}>
        <span>© {new Date().getFullYear()} ARCHIVUM</span><span>For SJS students, contributors and the material they share.</span>
      </div>
    </div>
  </footer>;
}
