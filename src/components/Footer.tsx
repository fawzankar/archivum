'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const groups = [
    { title:'Library', items:[['Notes','/notes'],['Previous papers','/previous-papers'],['Subjects','/subjects'],['Tips & Tricks','/tips']] },
    { title:'Community', items:[['Upload material','/upload'],['Contributors','/contributors'],['Guidelines','/guidelines']] },
    { title:'About', items:[['About ARCHIVUM','/about'],['Privacy','/privacy'],['Terms','/terms']] },
  ];
  return <footer className="site-footer" style={{ borderColor:'var(--border)', background:'var(--surface)' }}>
    <div className="archive-shell py-10 sm:py-12">
      <div className="grid lg:grid-cols-[1.7fr_1fr_1fr_1fr] gap-8 lg:gap-10">
        <div>
          <div className="footer-brand"><span className="footer-mark"><span className="archivum-css-logo" /></span><div><strong>ARCHIVUM</strong><small>Academic archive · SJS</small></div></div>
          <p className="max-w-sm mt-4 text-sm leading-6" style={{ color:'var(--ink-muted)' }}>A focused academic archive for SJS students — useful material, organised properly.</p>
          <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-semibold" style={{ color:'var(--accent)' }}>Visit <span className="quest-word">QUEST</span> <ArrowUpRight className="w-3 h-3" /></a>
        </div>
        {groups.map(group => <div key={group.title}><div className="text-[10px] uppercase tracking-[.16em] font-bold" style={{ color:'var(--ink-faint)' }}>{group.title}</div><div className="mt-3 space-y-2.5">{group.items.map(([label,href]) => <Link key={href} href={href} className="block text-xs hover:text-[var(--accent)] transition-colors" style={{ color:'var(--ink-muted)' }}>{label}</Link>)}</div></div>)}
      </div>
      <div className="mt-9 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px]" style={{ borderColor:'var(--border-light)', color:'var(--ink-faint)' }}><span>© {new Date().getFullYear()} ARCHIVUM · Built for SJS students</span><span>Webapp developed by Fawzan Kar</span></div>
    </div>
  </footer>;
}
