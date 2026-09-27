'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return <footer className="mt-20 pb-24 md:pb-8 border-t" style={{borderColor:'var(--border)',background:'var(--ivory)'}}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid md:grid-cols-[1.4fr_.6fr] gap-10">
      <div><div className="flex items-center gap-3"><span className="w-11 h-11 rounded-[15px] flex items-center justify-center" style={{background:'var(--accent-light)',color:'var(--accent)'}}><span aria-hidden="true" className="archivum-mark w-full h-full m-1.5"/></span><div><div className="font-display font-bold text-lg">ARCHIVUM</div><div className="text-[9px] uppercase tracking-[.2em] font-bold" style={{color:'var(--ink-faint)'}}>SISTER ORGANISATION OF QUEST</div></div></div><p className="max-w-lg mt-4 text-sm leading-relaxed" style={{color:'var(--ink-muted)'}}>A place for SJS students for all the materials they need — organised by class so the useful things stay close when exams get serious.</p><a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-bold transition-transform hover:-translate-y-0.5" style={{borderColor:'var(--border)',color:'var(--accent)',background:'var(--surface)'}}>Visit Quest <ArrowUpRight className="w-3 h-3"/></a><p className="mt-4 text-[11px] font-semibold" style={{color:'var(--accent)'}}>Webapp developed by Fawzan Kar</p></div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-xs font-semibold"><Link href="/notes" style={{color:'var(--ink-muted)'}}>Notes</Link><Link href="/previous-papers" style={{color:'var(--ink-muted)'}}>Papers</Link><Link href="/tips" style={{color:'var(--ink-muted)'}}>Tips & Tricks</Link><Link href="/upload" style={{color:'var(--ink-muted)'}}>Upload</Link><Link href="/guidelines" style={{color:'var(--ink-muted)'}}>Guidelines</Link><Link href="/privacy" style={{color:'var(--ink-muted)'}}>Privacy</Link><Link href="/terms" style={{color:'var(--ink-muted)'}}>Terms</Link><Link href="/about" className="inline-flex items-center gap-1" style={{color:'var(--accent)'}}>About <ArrowUpRight className="w-3 h-3"/></Link></div>
    </div>
    <div className="border-t py-4 text-center text-[10px]" style={{borderColor:'var(--border-light)',color:'var(--ink-faint)'}}>© {new Date().getFullYear()} ARCHIVUM · Built for SJS students</div>
  </footer>;
}
