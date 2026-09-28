'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const groups=[
    {title:'Library',items:[['Notes','/notes'],['Previous papers','/previous-papers'],['Subjects','/subjects'],['Tips & Tricks','/tips']]},
    {title:'Community',items:[['Upload material','/upload'],['Contributors','/contributors'],['Guidelines','/guidelines']]},
    {title:'About',items:[['About ARCHIVUM','/about'],['Privacy','/privacy'],['Terms','/terms']]}
  ];
  return <footer className="mt-10 border-t pb-24 md:pb-8" style={{borderColor:'var(--border)',background:'var(--surface)'}}>
    <div className="archive-shell py-12 sm:py-16">
      <div className="grid lg:grid-cols-[1.7fr_1fr_1fr_1fr] gap-10 lg:gap-8">
        <div>
          <div className="flex items-center gap-3"><span className="brand-logo w-10 h-10 rounded-xl flex items-center justify-center"><span className="archivum-css-logo w-[74%] h-[74%]"/></span><div className="font-display text-lg tracking-[.1em]">ARCHIVUM</div></div>
          <p className="max-w-sm mt-5 text-sm leading-6" style={{color:'var(--ink-muted)'}}>A focused academic archive for SJS students — useful material, organised properly.</p>
          <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-5 text-[11px] font-semibold" style={{color:'var(--accent)'}}>Visit <span className="quest-word">QUEST</span> <ArrowUpRight className="w-3 h-3"/></a>
        </div>
        {groups.map(group=><div key={group.title}><div className="text-[10px] uppercase tracking-[.16em] font-bold" style={{color:'var(--ink-faint)'}}>{group.title}</div><div className="mt-4 space-y-3">{group.items.map(([label,href])=><Link key={href} href={href} className="block text-xs hover:text-[var(--accent)] transition-colors" style={{color:'var(--ink-muted)'}}>{label}</Link>)}</div></div>)}
      </div>
      <div className="mt-12 pt-5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px]" style={{borderColor:'var(--border-light)',color:'var(--ink-faint)'}}><span>© {new Date().getFullYear()} ARCHIVUM · Built for SJS students</span><span>Webapp developed by Fawzan Kar</span></div>
    </div>
  </footer>;
}
