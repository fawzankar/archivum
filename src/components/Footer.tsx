'use client';
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return <footer className="mt-10 border-t" style={{borderColor:'var(--border)',background:'var(--surface)'}}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-[1.4fr_.6fr] gap-10">
      <div>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 flex items-center justify-center" style={{color:'var(--accent)'}}><span aria-hidden="true" className="archivum-css-logo w-8 h-8" /></span>
          <div><div className="font-display font-semibold text-xl">ARCHIVUM</div><div className="text-[10px] font-medium" style={{color:'var(--ink-muted)'}}>Sister organisation of SJS <span className="quest-word">QUEST</span></div></div>
        </div>
        <p className="max-w-xl mt-5 text-sm leading-6" style={{color:'var(--ink-muted)'}}>Fawzan Kar started ARCHIVUM after seeing how often useful papers and quick notes were hard to find when students actually needed them.</p>
        <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex mt-5 text-sm font-medium" style={{color:'var(--accent)'}}>Visit <span className="quest-word ml-1">QUEST</span></a>
      </div>
      <div className="grid grid-cols-2 gap-y-3 text-sm font-medium">
        <Link href="/notes" style={{color:'var(--ink-muted)'}}>Notes</Link><Link href="/previous-papers" style={{color:'var(--ink-muted)'}}>Previous papers</Link>
        <Link href="/tips" style={{color:'var(--ink-muted)'}}>Tips & Tricks</Link><Link href="/upload" style={{color:'var(--ink-muted)'}}>Upload</Link>
        <Link href="/contributors" style={{color:'var(--ink-muted)'}}>Contributors</Link><Link href="/about" style={{color:'var(--ink-muted)'}}>About</Link>
        <Link href="/guidelines" style={{color:'var(--ink-muted)'}}>Guidelines</Link><Link href="/privacy" style={{color:'var(--ink-muted)'}}>Privacy</Link>
        <Link href="/terms" style={{color:'var(--ink-muted)'}}>Terms</Link>
      </div>
    </div>
    <div className="border-t py-4 text-center text-xs" style={{borderColor:'var(--border-light)',color:'var(--ink-faint)'}}>© {new Date().getFullYear()} ARCHIVUM · For SJS students</div>
  </footer>;
}
