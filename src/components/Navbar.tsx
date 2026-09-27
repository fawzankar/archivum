'use client';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, Search, X, Sun, Moon, Check, Plus } from 'lucide-react';
import { useStudentClass, type StudentClass } from './StudentClassContext';
import { useTheme } from './ThemeContext';

const navLinks = [
  {href:'/', label:'Home'},
  {href:'/notes', label:'Notes'},
  {href:'/previous-papers', label:'Previous papers'},
  {href:'/subjects', label:'Subjects'},
  {href:'/tips', label:'Tips & Tricks'},
  {href:'/about', label:'About'},
  {href:'/contributors', label:'Contributors'},
];
const ACCENTS = [
  {id:'mono',color:'#0b5c75',label:'Deep blue'}, {id:'violet',color:'#5d4c9e',label:'Violet'},
  {id:'sky',color:'#166c91',label:'Sky'}, {id:'ocean',color:'#0b6f73',label:'Ocean'}, {id:'rose',color:'#9b4057',label:'Rose'},
];

export default function Navbar(){
  const pathname=usePathname(); const router=useRouter(); const searchParams=useSearchParams();
  const {studentClass,setStudentClass,resetStudentClass}=useStudentClass(); const {mode,setMode,accent,setAccent}=useTheme();
  const [drawerOpen,setDrawerOpen]=useState(false); const [searchOpen,setSearchOpen]=useState(false); const [classOpen,setClassOpen]=useState(false); const searchRef=useRef<HTMLInputElement>(null);
  const hrefWithClass=(href:string)=>{ if(!studentClass) return href; const sep=href.includes('?')?'&':'?'; return `${href}${sep}class=${studentClass}`; };
  const active=(href:string)=>href==='/'?pathname==='/':pathname.startsWith(href);
  const changeClass=(level:StudentClass)=>{setClassOpen(false);setDrawerOpen(false);setStudentClass(level);const qs=new URLSearchParams(searchParams.toString());qs.set('class',String(level));router.replace(`${pathname}?${qs.toString()}`,{scroll:false});router.refresh();};
  return <>
    <header className="sticky top-0 z-40 border-b" style={{background:'color-mix(in srgb,var(--surface) 94%,var(--ivory))',borderColor:'var(--border)'}}>
      <div className="max-w-7xl mx-auto h-[68px] px-4 sm:px-6 flex items-center gap-6">
        <Link href={hrefWithClass('/')} className="flex items-center gap-3 shrink-0">
          <span className="w-8 h-8 flex items-center justify-center" style={{color:'var(--accent)'}}><span className="archivum-css-logo w-7 h-7" /></span>
          <span className="font-display text-xl tracking-tight">ARCHIVUM</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium" style={{color:'var(--ink-muted)'}}>
          {navLinks.slice(0,5).map(item=><Link key={item.href} href={hrefWithClass(item.href)} style={{color:active(item.href)?'var(--ink)':'var(--ink-muted)'}}>{item.label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <button onClick={()=>setClassOpen(v=>!v)} className="h-9 px-3 border text-xs font-medium" style={{background:'var(--surface)',borderColor:'var(--border)',color:'var(--ink)'}}>Class {studentClass||'—'}</button>
            {classOpen&&<div className="absolute right-0 top-11 w-36 border p-1" style={{background:'var(--surface)',borderColor:'var(--border)'}}>{[9,10,11,12].map(level=><button key={level} onClick={()=>changeClass(level as StudentClass)} className="w-full flex items-center justify-between px-3 py-2.5 text-sm" style={{color:'var(--ink)'}}><span>Class {level}</span>{studentClass===level&&<Check className="w-4 h-4" style={{color:'var(--accent)'}}/>}</button>)}</div>}
          </div>
          <button onClick={()=>setSearchOpen(v=>!v)} className="icon-button w-9 h-9 flex items-center justify-center" aria-label="Search"><Search className="w-4 h-4"/></button>
          <button onClick={()=>setMode(mode==='dark'?'light':'dark')} className="icon-button w-9 h-9 hidden sm:flex items-center justify-center" aria-label="Toggle theme">{mode==='dark'?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}</button>
          <Link href={hrefWithClass('/upload')} className="hidden sm:inline-flex h-9 items-center gap-2 px-3 text-sm font-medium" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}><Plus className="w-4 h-4"/>Upload</Link>
          <button onClick={()=>setDrawerOpen(true)} className="icon-button w-9 h-9 flex items-center justify-center" aria-label="Open menu"><Menu className="w-4 h-4"/></button>
        </div>
      </div>
      {searchOpen&&<form onSubmit={e=>{e.preventDefault();const q=(searchRef.current?.value||'').trim();router.push(q?`/search?q=${encodeURIComponent(q)}${studentClass?`&class=${studentClass}`:''}`:'/search');setSearchOpen(false);}} className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex gap-2"><Search className="w-4 h-4 mt-2.5" style={{color:'var(--accent)'}}/><input ref={searchRef} autoFocus className="flex-1 border-b bg-transparent py-2 outline-none text-sm" style={{borderColor:'var(--border)',color:'var(--ink)'}} placeholder="Search by topic, chapter, paper or subject"/><button type="button" onClick={()=>setSearchOpen(false)} className="text-xs font-medium" style={{color:'var(--ink-muted)'}}>Close</button></form>}
    </header>

    <div className={`fixed inset-0 z-50 ${drawerOpen?'':'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/35 transition-opacity ${drawerOpen?'opacity-100':'opacity-0'}`} onClick={()=>setDrawerOpen(false)}/>
      <aside className={`absolute right-0 top-0 h-full w-[90%] max-w-[420px] border-l p-5 flex flex-col transition-transform duration-200 ${drawerOpen?'translate-x-0':'translate-x-full'}`} style={{background:'var(--surface)',borderColor:'var(--border)'}}>
        <div className="flex items-center justify-between pb-5 border-b" style={{borderColor:'var(--border)'}}><div className="flex items-center gap-3"><span className="w-8 h-8" style={{color:'var(--accent)'}}><span className="archivum-css-logo w-7 h-7"/></span><span className="font-display text-xl">ARCHIVUM</span></div><button onClick={()=>setDrawerOpen(false)} className="icon-button w-9 h-9 flex items-center justify-center" aria-label="Close menu"><X className="w-4 h-4"/></button></div>
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="grid gap-1">{navLinks.map(item=><Link key={item.href} href={hrefWithClass(item.href)} onClick={()=>setDrawerOpen(false)} className="px-3 py-3 text-sm font-medium" style={{color:active(item.href)?'var(--accent)':'var(--ink)'}}>{item.label}</Link>)}</nav>
          <div className="mt-8 pt-6 border-t" style={{borderColor:'var(--border)'}}><p className="text-sm font-medium">Your class</p><p className="text-xs mt-1" style={{color:'var(--ink-muted)'}}>Change the class used across the archive.</p><div className="grid grid-cols-4 gap-2 mt-4">{[9,10,11,12].map(level=><button key={level} onClick={()=>changeClass(level as StudentClass)} className="border py-2.5 text-sm font-medium" style={{borderColor:studentClass===level?'var(--accent)':'var(--border)',background:studentClass===level?'var(--accent-light)':'var(--surface)',color:studentClass===level?'var(--accent)':'var(--ink)'}}>Class {level}</button>)}</div><button onClick={()=>{resetStudentClass();setDrawerOpen(false);}} className="mt-3 text-xs font-medium" style={{color:'var(--ink-muted)'}}>Reset class profile</button></div>
          <div className="mt-8 pt-6 border-t" style={{borderColor:'var(--border)'}}><p className="text-sm font-medium">Accent colour</p><div className="flex gap-2 mt-4">{ACCENTS.map(item=><button key={item.id} onClick={()=>setAccent(item.id)} aria-label={item.label} className="w-8 h-8 border-2" style={{background:item.color,borderColor:accent===item.id?'var(--ink)':'transparent'}}/>)}</div></div>
        </div>
        <p className="pt-5 border-t text-xs leading-5" style={{borderColor:'var(--border)',color:'var(--ink-faint)'}}>ARCHIVUM is built around the material SJS students actually need to find again: notes, papers and useful exam advice.</p>
      </aside>
    </div>
  </>;
}
