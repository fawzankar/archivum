use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme, ACCENTS } from './ThemeContext';
import { useStudentClass } from './StudentClassContext';
import { Search, Plus, Sun, Moon, X, Menu, Home, BookOpen, FileText, Lightbulb, Palette, Check, Layers3, Info, Users, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode, accent, setAccent } = useTheme();
  const { studentClass, setStudentClass, resetStudentClass } = useStudentClass();
  const [drawerOpen,setDrawerOpen]=useState(false), [searchOpen,setSearchOpen]=useState(false), [classOpen,setClassOpen]=useState(false), [scrolled,setScrolled]=useState(false);
  const searchRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{const f=()=>setScrolled(window.scrollY>12);window.addEventListener('scroll',f,{passive:true});return()=>window.removeEventListener('scroll',f)},[]);
  useEffect(()=>{document.body.style.overflow=drawerOpen?'hidden':'';return()=>{document.body.style.overflow=''}},[drawerOpen]);
  useEffect(()=>{setDrawerOpen(false);setSearchOpen(false);setClassOpen(false)},[pathname]);
  useEffect(()=>{if(searchOpen) requestAnimationFrame(()=>searchRef.current?.focus())},[searchOpen]);

  const links=[
    ['Home','/',Home],['Notes','/notes',BookOpen],['Previous Papers','/previous-papers',FileText],
    ['Subjects','/subjects',Layers3],['Tips & Tricks','/tips',Lightbulb],['Contributors','/contributors',Users],['About','/about',Info]
  ] as const;
  const withClass=(href:string)=>studentClass?`${href}${href.includes('?')?'&':'?'}class=${studentClass}`:href;
  const active=(href:string)=>href==='/'?pathname==='/':pathname.startsWith(href);
  const chooseClass=(level:9|10|11|12)=>{setStudentClass(level);setClassOpen(false);setDrawerOpen(false);router.replace(`${pathname}?class=${level}`,{scroll:false})};

  return <>
    <header className={`sticky top-0 z-40 border-b transition-shadow ${scrolled?'shadow-[0_8px_24px_rgba(17,24,39,.06)]':''}`} style={{background:'color-mix(in srgb,var(--surface) 94%,transparent)',borderColor:'var(--border)',backdropFilter:'blur(10px)'}}>
      <div className="archive-shell h-[64px] flex items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <span className="brand-logo w-9 h-9 rounded-xl flex items-center justify-center shrink-0"><span className="archivum-css-logo w-[74%] h-[74%]"/></span>
          <span className="min-w-0"><span className="block font-display text-[15px] tracking-[.12em] leading-none">ARCHIVUM</span><span className="hidden sm:block text-[7px] uppercase tracking-[.12em] mt-1" style={{color:'var(--ink-faint)'}}>Sister organisation of <span className="quest-word">QUEST</span></span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5">
          {links.slice(0,5).map(([label,href])=><Link key={href} href={withClass(href)} className="text-[11px] font-medium transition-colors" style={{color:active(href)?'var(--accent)':'var(--ink-muted)'}}>{label}</Link>)}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="relative hidden md:block">
            <button onClick={()=>setClassOpen(v=>!v)} className="h-9 px-2.5 text-[10px] font-semibold border flex items-center gap-1.5" style={{borderColor:'var(--border)',background:'var(--surface)',color:'var(--ink-muted)'}}><Layers3 className="w-3.5 h-3.5"/>{studentClass?`Class ${studentClass}`:'Class'}</button>
            {classOpen&&<div className="absolute right-0 top-11 w-36 border p-1 bg-[var(--surface)] shadow-xl animate-fade" style={{borderColor:'var(--border)'}}>{[9,10,11,12].map(l=><button key={l} onClick={()=>chooseClass(l as 9|10|11|12)} className="w-full flex justify-between px-3 py-2.5 text-xs hover:bg-[var(--surface-raised)]">Class {l}{studentClass===l&&<Check className="w-4 h-4" style={{color:'var(--accent)'}}/>}</button>)}</div>}
          </div>
          <button onClick={()=>setSearchOpen(v=>!v)} className="header-icon icon-button" aria-label="Search"><Search/></button>
          <button onClick={()=>setMode(mode==='dark'?'light':'dark')} className="header-icon icon-button" aria-label="Toggle theme">{mode==='dark'?<Sun/>:<Moon/>}</button>
          <Link href={withClass('/upload')} className="hidden sm:inline-flex h-9 px-3 items-center gap-1.5 text-[10px] font-semibold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}><Plus className="w-3.5 h-3.5"/> Upload</Link>
          <button onClick={()=>setDrawerOpen(true)} className="header-icon icon-button" aria-label="Open menu"><Menu/></button>
        </div>
      </div>
      {searchOpen&&<form onSubmit={e=>{e.preventDefault();const q=searchRef.current?.value.trim()||'';router.push(q?`/search?q=${encodeURIComponent(q)}`:'/search');setSearchOpen(false)}} className="archive-shell pb-3 flex"><div className="w-full border-b-2 flex items-center gap-3 py-2" style={{borderColor:'var(--ink)'}}><Search className="w-4 h-4" style={{color:'var(--ink-muted)'}}/><input ref={searchRef} autoComplete="off" className="flex-1 bg-transparent outline-none text-sm" placeholder="Search notes, papers, subjects…"/><button type="button" onClick={()=>setSearchOpen(false)} aria-label="Close search"><X className="w-4 h-4"/></button></div></form>}
    </header>

    <div className={`fixed inset-0 z-50 transition-opacity ${drawerOpen?'opacity-100':'opacity-0 pointer-events-none'}`}>
      <button className="absolute inset-0 bg-black/35" onClick={()=>setDrawerOpen(false)} aria-label="Close menu"/>
      <aside className={`absolute right-0 top-0 h-full w-[min(390px,92vw)] bg-[var(--surface)] border-l p-5 flex flex-col shadow-2xl transition-transform duration-300 ${drawerOpen?'translate-x-0':'translate-x-full'}`} style={{borderColor:'var(--border)'}}>
        <div className="flex items-center justify-between pb-5 border-b" style={{borderColor:'var(--border-light)'}}>
          <div className="flex items-center gap-3"><span className="brand-logo w-10 h-10 rounded-xl flex items-center justify-center"><span className="archivum-css-logo w-[74%] h-[74%]"/></span><div><div className="font-display tracking-[.12em]">ARCHIVUM</div><div className="text-[8px] uppercase tracking-[.1em]" style={{color:'var(--ink-faint)'}}>Study archive</div></div></div>
          <button onClick={()=>setDrawerOpen(false)} className="header-icon icon-button"><X/></button>
        </div>
        <div className="flex-1 overflow-y-auto py-5">
          <div className="space-y-1">{links.map(([label,href,Icon])=><Link key={href} href={withClass(href)} onClick={()=>setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm" style={{color:active(href)?'var(--accent)':'var(--ink)',background:active(href)?'var(--accent-light)':'transparent'}}><Icon className="w-4 h-4"/>{label}<ChevronRight className="ml-auto w-3.5 h-3.5 opacity-35"/></Link>)}</div>
          <div className="mt-7 border-t pt-6" style={{borderColor:'var(--border-light)'}}>
            <div className="text-[10px] uppercase tracking-[.16em] font-bold" style={{color:'var(--ink-faint)'}}>Your class</div>
            <div className="grid grid-cols-4 gap-1.5 mt-3">{[9,10,11,12].map(l=><button key={l} onClick={()=>chooseClass(l as 9|10|11|12)} className="py-2.5 border text-[11px]" style={{borderColor:studentClass===l?'var(--accent)':'var(--border)',color:studentClass===l?'var(--accent)':'var(--ink)',background:studentClass===l?'var(--accent-light)':'var(--surface)'}}>Class {l}</button>)}</div>
            {studentClass&&<button onClick={()=>{resetStudentClass();setDrawerOpen(false)}} className="mt-2 text-[10px]" style={{color:'var(--ink-muted)'}}>Reset class profile</button>}
          </div>
          <div className="mt-7 border-t pt-6" style={{borderColor:'var(--border-light)'}}>
            <div className="flex items-center gap-2 text-xs"><Palette className="w-4 h-4" style={{color:'var(--accent)'}}/> Theme accent</div>
            <div className="grid grid-cols-5 gap-2 mt-3">{ACCENTS.map(item=><button key={item.id} onClick={()=>setAccent(item.id)} className="h-9 border flex items-center justify-center" style={{background:item.color,borderColor:accent===item.id?'var(--ink)':'transparent'}} aria-label={item.label}>{accent===item.id&&<Check className="w-4 h-4 text-white"/>}</button>)}</div>
          </div>
        </div>
        <div className="pt-4 border-t text-[10px] leading-5" style={{borderColor:'var(--border-light)',color:'var(--ink-faint)'}}>Cross-check important syllabus and examination information with official school or board sources.</div>
      </aside>
    </div>
  </>;
}
