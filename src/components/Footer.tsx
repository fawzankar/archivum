'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Archive } from 'lucide-react';

export default function Footer(){return <footer className="mt-20 border-t" style={{borderColor:'var(--line)',background:'var(--surface)'}}>
 <div className="max-w-[1480px] mx-auto px-5 sm:px-7 py-14 sm:py-20">
  <div className="grid lg:grid-cols-[1.4fr_.6fr_.6fr] gap-12">
   <div><div className="flex items-center gap-3"><span className="brand-logo w-11 h-11 flex items-center justify-center"><span className="archivum-css-logo w-[72%] h-[72%]"/></span><div><div className="font-display text-xl tracking-[.15em]">ARCHIVUM</div><div className="text-[8px] uppercase tracking-[.18em]" style={{color:'var(--ink-faint)'}}>The SJS Student Archive</div></div></div><p className="max-w-xl mt-6 text-sm leading-7" style={{color:'var(--ink-muted)'}}>An organised academic archive for SJS students — built to make useful material easier to find, easier to return to, and easier to share.</p><p className="mt-6 text-[9px] uppercase tracking-[.18em] font-bold" style={{color:'var(--gold)'}}>A sister organisation of <span className="quest-word">QUEST</span></p><p className="mt-3 text-[10px] font-semibold" style={{color:'var(--ink-muted)'}}>Webapp developed by Fawzan Kar</p></div>
   <div><div className="text-[9px] uppercase tracking-[.2em] font-bold mb-5" style={{color:'var(--ink-faint)'}}>Explore</div><div className="grid gap-3 text-xs">{[['Notes','/notes'],['Previous Papers','/previous-papers'],['Subjects','/subjects'],['Tips & Tricks','/tips'],['Upload','/upload']].map(([x,h])=><Link key={h} href={h} style={{color:'var(--ink-muted)'}}>{x}</Link>)}</div></div>
   <div><div className="text-[9px] uppercase tracking-[.2em] font-bold mb-5" style={{color:'var(--ink-faint)'}}>Archive</div><div className="grid gap-3 text-xs">{[['About','/about'],['Contributors','/contributors'],['Guidelines','/guidelines'],['Privacy','/privacy'],['Terms','/terms']].map(([x,h])=><Link key={h} href={h} className="inline-flex items-center gap-1" style={{color:'var(--ink-muted)'}}>{x}<ArrowUpRight className="w-3 h-3 opacity-40"/></Link>)}</div></div>
  </div>
 </div>
 <div className="border-t" style={{borderColor:'var(--line-soft)'}}><div className="max-w-[1480px] mx-auto px-5 sm:px-7 py-4 flex items-center justify-between gap-4 text-[9px] uppercase tracking-[.13em]" style={{color:'var(--ink-faint)'}}><span>© {new Date().getFullYear()} ARCHIVUM</span><span className="flex items-center gap-2"><Archive className="w-3 h-3"/> Built for SJS students</span></div></div>
 </footer>}
