'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeContext';
import { useStudentClass } from './StudentClassContext';
import { Search, Sun, Moon, X, Menu, ChevronRight, Home, BookOpen, FileText, Lightbulb, Layers3, Info, Users } from 'lucide-react';

const links = [
  ['Home','/',Home], ['Notes','/notes',BookOpen], ['Previous Papers','/previous-papers',FileText],
  ['Subjects','/subjects',Layers3], ['Tips & Tricks','/tips',Lightbulb], ['Contributors','/contributors',Users], ['About','/about',Info]
] as const;

export default function Navbar() {
  const pathname = usePathname(); const router = useRouter(); const { mode, setMode } = useTheme(); const { studentClass } = useStudentClass();
  const [drawerOpen,setDrawerOpen]=useState(false), [searchOpen,setSearchOpen]=useState(false), [scrolled,setScrolled]=useState(false); const searchRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{const f=()=>setScrolled(window.scrollY>16);window.addEventListener('scroll',f,{passive:true});return()=>window.removeEventListener('scroll',f)},[]);
  useEffect(()=>{document.body.style.overflow=drawerOpen?'hidden':'';return()=>{document.body.style.overflow=''}},[drawerOpen]);
  useEffect(()=>{setDrawerOpen(false);setSearchOpen(false)},[pathname]);
  useEffect(()=>{if(searchOpen) requestAnimationFrame(()=>searchRef.current?.focus())},[searchOpen]);
  const withClass=(href:string)=>studentClass?`${href}${href.includes('?')?'&':'?'}class=${studentClass}`:href;
  const active=(href:string)=>href==='/'?pathname==='/':pathname.startsWith(href);
  return <>
    <header className={`site-header ${scrolled?'is-scrolled':''}`}>
      <div className="archive-shell site-header-inner">
        <Link href="/" className="brand-lockup" aria-label="ARCHIVUM home">
          <span className="brand-logo"><span className="archivum-css-logo"/></span>
          <span><strong>ARCHIVUM</strong><small>Academic archive · SJS</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">{links.slice(0,5).map(([label,href])=><Link key={href} href={withClass(href)} className={active(href)?'active':''}>{label}</Link>)}</nav>
        <div className="header-actions">
          <button className="header-action search-trigger" onClick={()=>setSearchOpen(v=>!v)} aria-label="Search"><Search/></button>
          <button className="header-action theme-trigger" onClick={()=>setMode(mode==='dark'?'light':'dark')} aria-label="Toggle theme">{mode==='dark'?<Sun/>:<Moon/>}</button>
          <button className="header-menu" onClick={()=>setDrawerOpen(true)} aria-label="Open menu"><span>MENU</span><Menu/></button>
        </div>
      </div>
      {searchOpen&&<form className="header-search" onSubmit={e=>{e.preventDefault();const q=searchRef.current?.value.trim()||'';router.push(q?`/search?q=${encodeURIComponent(q)}`:'/search');setSearchOpen(false)}}><div className="archive-shell"><div className="header-search-field"><Search/><input ref={searchRef} autoComplete="off" placeholder="Search notes, papers, subjects…"/><kbd>⌘ K</kbd><button type="button" onClick={()=>setSearchOpen(false)} aria-label="Close search"><X/></button></div></div></form>}
    </header>
    <div className={`menu-layer ${drawerOpen?'open':''}`}><button className="menu-scrim" onClick={()=>setDrawerOpen(false)} aria-label="Close menu"/><aside className="menu-drawer">
      <div className="menu-top"><div className="brand-lockup"><span className="brand-logo"><span className="archivum-css-logo"/></span><span><strong>ARCHIVUM</strong><small>Study archive</small></span></div><button className="header-action" onClick={()=>setDrawerOpen(false)} aria-label="Close menu"><X/></button></div>
      <div className="menu-scroll"><div className="menu-section-label">Explore</div><div className="menu-links">{links.map(([label,href,Icon])=><Link key={href} href={withClass(href)} onClick={()=>setDrawerOpen(false)} className={active(href)?'active':''}><Icon/><span>{label}</span><ChevronRight/></Link>)}</div>
        <div className="menu-section"><div className="menu-section-label">Your class</div><div className="class-grid">{[9,10,11,12].map(level=><Link key={level} href={`/?class=${level}`} onClick={()=>setDrawerOpen(false)} className={studentClass===level?'active':''}>Class {level}</Link>)}</div></div>
      </div>
      <div className="menu-note">Use the archive for revision and practice. Cross-check important syllabus and examination information with official school or board sources.</div>
    </aside></div>
  </>;
}
