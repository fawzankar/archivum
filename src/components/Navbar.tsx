'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme, ACCENTS } from './ThemeContext';
import { useStudentClass } from './StudentClassContext';
import { Archive, Search, Plus, Sun, Moon, X, Menu, BookOpen, FileText, Lightbulb, Palette, Check, ChevronRight, Settings2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { mode, setMode, accent, setAccent } = useTheme();
  const { studentClass, resetStudentClass } = useStudentClass();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 8); window.addEventListener('scroll', onScroll, { passive:true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => { document.body.style.overflow = drawerOpen ? 'hidden' : ''; return () => { document.body.style.overflow=''; }; }, [drawerOpen]);
  useEffect(() => { setDrawerOpen(false); setPaletteOpen(false); }, [pathname]);

  const navLinks = [
    { label:'Home', href:'/' }, { label:'Notes', href:'/notes', icon:BookOpen }, { label:'Papers', href:'/previous-papers', icon:FileText }, { label:'Tips', href:'/tips', icon:Lightbulb },
  ];
  const hrefWithClass = (href:string) => studentClass ? `${href}${href.includes('?')?'&':'?'}class=${studentClass}` : href;
  const isActive = (href:string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return <>
    <header className={`sticky top-0 z-40 border-b transition-all ${scrolled?'premium-shadow':''}`} style={{ background:'color-mix(in srgb,var(--surface) 84%,transparent)', borderColor:scrolled?'var(--border)':'var(--border-light)', backdropFilter:'blur(22px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] sm:h-[76px] flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="ARCHIVUM home">
          <span className="w-10 h-10 rounded-[14px] flex items-center justify-center transition-transform group-hover:-rotate-6" style={{ background:'var(--accent)', color:'var(--accent-contrast)', boxShadow:'0 8px 24px var(--accent-glow)' }}><Archive className="w-5 h-5" /></span>
          <span className="hidden xs:block"><span className="block font-display font-bold text-[16px] leading-none tracking-tight">ARCHIVUM</span><span className="block text-[8px] uppercase tracking-[.22em] mt-1 font-bold" style={{color:'var(--ink-faint)'}}>SJS STUDENT ARCHIVE</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl border" style={{ background:'var(--surface-raised)', borderColor:'var(--border-light)' }}>
          {navLinks.map(item=>{ const Icon=item.icon; const active=isActive(item.href); return <Link key={item.href} href={hrefWithClass(item.href)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all" style={{background:active?'var(--accent)':'transparent',color:active?'var(--accent-contrast)':'var(--ink-muted)'}}>{Icon&&<Icon className="w-3.5 h-3.5"/>}{item.label}</Link>; })}
        </nav>

        <div className="flex items-center gap-1.5">
          {studentClass && <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold" style={{background:'var(--accent-light)',color:'var(--accent)'}}>Class {studentClass}</span>}
          <button onClick={()=>setSearchOpen(v=>!v)} className="icon-button w-10 h-10 rounded-xl flex items-center justify-center" aria-label="Search"><Search className="w-4 h-4"/></button>
          <button onClick={()=>setMode(mode==='dark'?'light':'dark')} className="icon-button w-10 h-10 rounded-xl hidden sm:flex items-center justify-center" aria-label="Toggle theme">{mode==='dark'?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}</button>
          <div className="relative hidden lg:block">
            <button onClick={()=>setPaletteOpen(v=>!v)} className="icon-button w-10 h-10 rounded-xl flex items-center justify-center" aria-label="Accent theme"><Palette className="w-4 h-4" style={{color:'var(--accent)'}}/></button>
            {paletteOpen && <div className="absolute right-0 top-12 w-56 rounded-2xl border p-2 shadow-2xl animate-fade" style={{background:'var(--surface)',borderColor:'var(--border)'}}><p className="px-2 py-1.5 text-[10px] uppercase tracking-wider font-bold" style={{color:'var(--ink-faint)'}}>Accent</p>{ACCENTS.map(item=><button key={item.id} onClick={()=>{setAccent(item.id);setPaletteOpen(false)}} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5" style={{color:'var(--ink)'}}><span className="w-4 h-4 rounded-full" style={{background:item.color}}/><span className="flex-1 text-left">{item.label}</span>{accent===item.id&&<Check className="w-4 h-4" style={{color:'var(--accent)'}}/>}</button>)}</div>}
          </div>
          <Link href={hrefWithClass('/upload')} className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}><Plus className="w-3.5 h-3.5"/> Upload</Link>
          <button onClick={()=>setDrawerOpen(true)} className="icon-button w-10 h-10 rounded-xl md:hidden flex items-center justify-center" aria-label="Open menu"><Menu className="w-5 h-5"/></button>
        </div>
      </div>
      {searchOpen&&<div className="border-t animate-fade" style={{background:'var(--surface)',borderColor:'var(--border)'}}><form onSubmit={e=>{e.preventDefault();const q=(searchRef.current?.value||'').trim();window.location.href=q?`/search?q=${encodeURIComponent(q)}`:'/search'}} className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3"><Search className="w-4 h-4" style={{color:'var(--accent)'}}/><input ref={searchRef} className="flex-1 bg-transparent outline-none text-sm" placeholder="Search your class archive…" style={{color:'var(--ink)'}}/><button type="button" onClick={()=>setSearchOpen(false)} className="p-2" style={{color:'var(--ink-muted)'}}><X className="w-4 h-4"/></button></form></div>}
    </header>

    {drawerOpen&&<div className="fixed inset-0 z-50 md:hidden"><div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={()=>setDrawerOpen(false)}/><aside className="absolute right-0 top-0 h-full w-[88%] max-w-sm p-4 flex flex-col shadow-2xl" style={{background:'var(--surface)'}}>
      <div className="flex items-center justify-between p-2 pb-5 border-b" style={{borderColor:'var(--border-light)'}}><div className="flex items-center gap-2.5"><span className="w-10 h-10 rounded-[14px] flex items-center justify-center" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}><Archive className="w-5 h-5"/></span><div><div className="font-display font-bold">ARCHIVUM</div><div className="text-[9px] uppercase tracking-[.16em]" style={{color:'var(--ink-faint)'}}>SJS student archive</div></div></div><button onClick={()=>setDrawerOpen(false)} className="icon-button w-10 h-10 rounded-xl flex items-center justify-center"><X className="w-5 h-5"/></button></div>
      <div className="flex-1 overflow-y-auto py-5 space-y-6">
        <div className="space-y-1">{navLinks.map(item=>{const Icon=item.icon;return <Link key={item.href} href={hrefWithClass(item.href)} onClick={()=>setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-xs font-bold" style={{background:isActive(item.href)?'var(--accent-light)':'transparent',color:isActive(item.href)?'var(--accent)':'var(--ink)'}}>{Icon&&<Icon className="w-4 h-4"/>}{item.label}<ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40"/></Link>})}</div>
        <Link href={hrefWithClass('/upload')} onClick={()=>setDrawerOpen(false)} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-xs font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}><Plus className="w-4 h-4"/> Upload resource</Link>
        <div className="rounded-2xl border p-4 space-y-3" style={{borderColor:'var(--border)',background:'var(--surface-raised)'}}><div className="flex items-center gap-2"><Settings2 className="w-4 h-4" style={{color:'var(--accent)'}}/><span className="text-xs font-bold">Your setup</span></div><div className="flex items-center justify-between"><span className="text-xs" style={{color:'var(--ink-muted)'}}>Class profile</span><strong className="text-xs">{studentClass?`Class ${studentClass}`:'Not set'}</strong></div>{studentClass&&<button onClick={()=>{resetStudentClass();setDrawerOpen(false);window.location.reload()}} className="w-full rounded-xl border py-2.5 text-[11px] font-bold" style={{borderColor:'var(--border)',color:'var(--ink)'}}>Change class</button>}</div>
        <div className="rounded-2xl border p-4" style={{borderColor:'var(--border)',background:'var(--surface-raised)'}}><div className="flex items-center gap-2 mb-3"><Palette className="w-4 h-4" style={{color:'var(--accent)'}}/><span className="text-xs font-bold">Theme accents</span></div><div className="grid grid-cols-5 gap-2">{ACCENTS.map(item=><button key={item.id} onClick={()=>setAccent(item.id)} className="h-9 rounded-xl border-2 flex items-center justify-center" style={{background:item.color,borderColor:accent===item.id?'var(--ink)':'transparent'}} aria-label={item.label}>{accent===item.id&&<Check className="w-4 h-4" style={{color:item.id==='mono'&&mode==='light'?'#fff':'#fff'}}/>}</button>)}</div></div>
      </div>
      <div className="pt-4 border-t text-[10px] leading-relaxed" style={{borderColor:'var(--border-light)',color:'var(--ink-faint)'}}>ARCHIVUM is a student resource archive. Always cross-check important syllabus and exam information with official school or board sources.</div>
    </aside></div>}
  </>;
}
