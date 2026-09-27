'use client';
import React from 'react';
import { useTheme } from './ThemeContext';
import Link from 'next/link';

export default function Footer() {
  const { mode } = useTheme();
  return (
    <footer className="mt-20 border-t" style={{borderColor:'var(--border)',background:'var(--surface)'}}>
      <div className="archive-shell py-10 sm:py-14 grid md:grid-cols-[1.4fr_.6fr] gap-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="brand-logo"><img src={mode === 'dark' ? '/archivum-logo-light.png' : '/archivum-logo-dark.png'} alt="" className="w-[72%] h-[72%] object-contain" /></span>
            <div>
              <div className="site-header__wordmark">ARCHIVUM</div>
              <div className="text-[10px] mt-1" style={{color:'var(--ink-faint)'}}>A study archive for SJS students</div>
            </div>
          </div>
          <p className="max-w-xl mt-5 text-sm leading-relaxed" style={{color:'var(--ink-muted)'}}>
            Fawzan Kar started ARCHIVUM after repeatedly looking for old papers
            and quick notes that should have been easier for SJS students to find.
          </p>
          <a className="btn btn-secondary mt-5" href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer">
            Visit QUEST
          </a>
        </div>
        <nav className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm" aria-label="Footer">
          <Link href="/notes">Notes</Link>
          <Link href="/previous-papers">Papers</Link>
          <Link href="/tips">Tips & Tricks</Link>
          <Link href="/upload">Upload</Link>
          <Link href="/contributors">Contributors</Link>
          <Link href="/about">About</Link>
          <Link href="/guidelines">Guidelines</Link>
          <Link href="/saved">Saved</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
      <div className="border-t" style={{borderColor:'var(--border-light)'}}>
        <div className="archive-shell py-4 text-xs" style={{color:'var(--ink-faint)'}}>
          © {new Date().getFullYear()} ARCHIVUM · Made for the SJS student community.
        </div>
      </div>
    </footer>
  );
}
