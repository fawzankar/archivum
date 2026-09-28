'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme, ACCENTS } from './ThemeContext';
import { useStudentClass } from './StudentClassContext';
import { Search, Plus, Sun, Moon, X, Menu, Home, BookOpen, FileText, Lightbulb, Palette, Check, ChevronRight, Settings2, Layers3, Info, Users } from 'lucide-react';

export default function Navbar(){
 const pathname=usePathname(); const router=useRouter();
 const {mode,setMode,accent,setAccent}=useTheme(); const {studentClass,setStudentClass,resetStudentClass}=useStudentClass();
 const [drawerOpen,setDrawerOpen]=useState(false),[searchOpen,setSearchOpen]=useState(false),[classOpen,setClassOpen]=useState(false),[scrolled,setScrolled]=useState(false);
 const searchRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{const f=()=>setScrolled(window.scrollY>20);window.addEventListener('scroll',f,{passive:true});return()=>window.removeEventListener('scroll',f)},[]);
 useEffect(()=>{if(searchOpen)requestAnimationFrame(()=>searchRef.current?.focus())},[searchOpen]);
 useEffect(()=>{document.body.style.overflow=drawerOpen?'hidden':'';return()=>{document.body.style.overflow=''}},[drawerOpen]);
 useEffect(()=>{setDrawerOpen(false);setSearchOpen(false);setClassOpen(false)},[pathname]);
 const nav=[['Home','/',Home],['Notes','/notes',BookOpen],['Previous Papers','/previous-papers',FileText],['Subjects','/subjects',Layers3],['Tips & Tricks','/tips',Lightbulb],['About Us','/about',Info],['Contributors','/contributors',Users]] as const;
 const href=(h:string)=>studentClass?`${h}${h.includes('?')?'&':'?'}class=${studentClass}`:h;
 const active=(h:string)=>h==='/'?pathname==='/':pathname.startsWith(h);
 const changeClass=(level:9|10|11|12)=>{setClassOpen(false);setDrawerOpen(false);setStudentClass(level);router.replace(`${pathname}?class=${level}`,{scroll:false})};
 return <>
  <header className={`relative z-40 sticky top-0 border-b transition-shadow duration-300 ${scrolled?'shadow-[0_15px_45px_rgba(20,25,22,.10)]':''}`} style={{background:'color-mix(in srgb,var(--paper) 92%,transparent)',borderColor:'var(--line)',backdropFilter:'blur(18px)'}}>
   <div className="max-w-[1480px] mx-auto h-[72px] px-4 sm:px-6 lg:px-7 flex items-center gap-8">
    <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="ARCHIVUM home">
      <span className="brand-logo w-9 h-9 flex items-center justify-center transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105"><span className="archivum-css-logo w-[72%] h-[72%]"/></span>
      <span><span className="block font-display text-[14px] tracking-[.18em] leading-none">ARCHIVUM</span><span className="block text-[7px] uppercase tracking-[.16em] mt-1" style={{color:'var(--ink-faint)'}}>SJS STUDENT ARCHIVE</span></span>
    </Link>
    <nav className="hidden xl:flex items-center gap-5 ml-6 flex-1">{nav.slice(0,5).map(([label,h])=><Link key={h} href={href(h)} className="relative text-[10px] font-semibold uppercase tracking-[.11em] py-7 transition-colors" style={{color:active(h)?'var(--accent)':'var(--ink-muted)'}}>{label}{active(h)&&<span className="absolute left-0 right-0 bottom-0 h-[2px]" style={{background:'var(--gold)'}}/>}</Link>)}</nav>
    <div className="ml-auto flex items-center gap-2">
      <div className="relative hidden md:block"><button onClick={()=>setClassOpen(v=>!v)} className="h-9 px-3 border text-[9px] font-bold tracking-[.12em] flex items-center gap-2" style={{borderColor:'var(--line)',background:'var(--surface)',color:'var(--accent)'}}><Layers3 className="w-3.5 h-3.5"/>CLASS {studentClass||'—'}</button>{classOpen&&<div className="absolute right-0 top-11 w-44 border p-2 shadow-2xl animate-fade" style={{background:'var(--surface)',borderColor:'var(--line)'}}><div className="px-2 py-2 text-[8px] uppercase tracking-[.18em]" style={{color:'var(--ink-faint)'}}>Choose class</div>{[9,10,11,12].map(level=><button key={level} onClick={()=>changeClass(level as 9|10|11|12)} className="w-full px-3 py-2.5 text-left text-xs flex justify-between hover:bg-[var(--surface-2)]" style={{color:'var(--ink)'}}>Class {level}{studentClass===level&&<Check className="w-3.5 h-3.5" style={{color:'var(--accent)'}}/>}</button>)}</div>}</div>}
      <button onClick={()=>setSearchOpen(v=>!v)} className="icon-button header-icon" aria-label="Search"><Search/></button>
      <button onClick={()=>setMode(mode==='dark'?'light':'dark')} className="icon-button header-icon" aria-label="Toggle theme">{mode==='dark'?<Sun/>:<Moon/>}</button>
      <Link href={href('/upload')} className="hidden sm:inline-flex h-9 px-4 items-center gap-2 text-[9px] uppercase tracking-[.13em] font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}><Plus className="w-3.5 h-3.5"/>Upload</Link>
      <button onClick={()=>setDrawerOpen(true)} className="icon-button header-icon xl:hidden" aria-label="Open menu"><Menu/></button>
    </div>
   </div>
   {searchOpen&&<form onSubmit={e=>{e.preventDefault();const q=(searchRef.current?.value||'').trim();router.push(q?`/search?q=${encodeURIComponent(q)}`:'/search');setSearchOpen(false)}} className="absolute top-[72px] right-3 sm:right-6 w-[min(520px,calc(100vw - 24px))] border p-2 flex items-center gap-2 shadow-2xl animate-fade" style={{background:'var(--surface)',borderColor:'var(--line)'}}><Search className="w-4 h-4 ml-2" style={{color:'var(--gold)'}}/><input ref={searchRef} className="flex-1 bg-transparent outline-none text-sm px-2 py-2" placeholder="Search the archive…" style={{color:'var(--ink)'}}/><button type="button" onClick={()=>setSearchOpen(false)} className="header-icon icon-button"><X/></button></form>}
  </header>
  <div className={`fixed inset-0 z-50 transition-opacity ${drawerOpen?'opacity-100 pointer-events-auto':'opacity-0 pointer-events-none'}`}>
   <div className="absolute inset-0 bg-black/55" onClick={()=>setDrawerOpen(false)}/>
   <aside className={`absolute right-0 top-0 h-full w-[90%] max-w-[430px] p-5 flex flex-col transition-transform duration-400 ${drawerOpen?'translate-x-0':'translate-x-full'}`} style={{background:'var(--surface)',borderLeft:'1px solid var(--line)'}}>
    <div className="flex items-center justify-between pb-5 border-b" style={{borderColor:'var(--line)'}}><div className="flex items-center gap-3"><span className="brand-logo w-10 h-10 flex items-center justify-center"><span className="archivum-css-logo w-[72%] h-[72%]"/></span><div><div className="font-display tracking-[.16em]">ARCHIVUM</div><div className="text-[8px] uppercase tracking-[.14em]" style={{color:'var(--ink-faint)'}}>Student Archive</div></div></div><button onClick={()=>setDrawerOpen(false)} className="icon-button header-icon"><X/></button></div>
    <div className="flex-1 overflow-y-auto py-6 space-y-7">
      <div>{nav.map(([label,h,Icon])=><Link key={h} href={href(h)} onClick={()=>setDrawerOpen(false)} className="flex items-center gap-3 py-3 border-b text-xs" style={{borderColor:'var(--line-soft)',color:active(h)?'var(--accent)':'var(--ink)'}}><Icon className="w-4 h-4"/>{label}<ChevronRight className="w-3 h-3 ml-auto opacity-35"/></Link>)}</div>
      <div className="grid grid-cols-2 gap-2"><a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="py-3 border text-[10px] uppercase tracking-[.1em] font-bold text-center" style={{borderColor:'var(--line)',color:'var(--accent)'}}>Visit Quest</a><Link href={href('/upload')} onClick={()=>setDrawerOpen(false)} className="py-3 text-[10px] uppercase tracking-[.1em] font-bold text-center" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>Upload</Link></div>
      <div className="border p-4" style={{borderColor:'var(--line)'}}><div className="flex items-center gap-2 text-xs font-semibold"><Settings2 className="w-4 h-4" style={{color:'var(--gold)'}}/>Your setup</div><div className="flex justify-between mt-4 text-xs"><span style={{color:'var(--ink-muted)'}}>Class profile</span><span>Class {studentClass||'—'}</span></div><div className="grid grid-cols-4 gap-1.5 mt-3">{[9,10,11,12].map(level=><button key={level} onClick={()=>changeClass(level as 9|10|11|12)} className="py-2 border text-[10px]" style={{borderColor:studentClass===level?'var(--accent)':'var(--line)',background:studentClass===level?'var(--accent-light)':'transparent',color:studentClass===level?'var(--accent)':'var(--ink)'}}>{level}</button>)}</div><button onClick={()=>{resetStudentClass();setDrawerOpen(false)}} className="w-full mt-3 py-2 border text-[10px]" style={{borderColor:'var(--line)',color:'var(--ink-muted)'}}>Reset class profile</button></div>
      <div className="border p-4" style={{borderColor:'var(--line)'}}><div className="flex items-center gap-2 text-xs font-semibold mb-3"><Palette className="w-4 h-4" style={{color:'var(--gold)'}}/>Accent</div><div className="grid grid-cols-5 gap-2">{ACCENTS.map(item=><button key={item.id} onClick={()=>setAccent(item.id)} aria-label={item.label} className="h-8 border-2" style={{background:item.color,borderColor:accent===item.id?'var(--ink)':'transparent'}}>{accent===item.id&&<Check className="w-3.5 h-3.5 mx-auto" style={{color:'#fff'}}/>}</button>)}</div></div>
    </div>
    <div className="border-t pt-4 text-[9px] leading-relaxed" style={{borderColor:'var(--line)',color:'var(--ink-faint)'}}>ARCHIVUM is a student resource archive. Cross-check syllabus and examination information with official school or board sources.</div>
   </aside>
  </div>
 </>;
}
