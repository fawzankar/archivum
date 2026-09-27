'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme, ACCENTS } from './ThemeContext';
import { useStudentClass } from './StudentClassContext';
import {
  Search, Plus, Sun, Moon, X, Menu, Home, BookOpen, FileText, Lightbulb,
  Palette, Check, ChevronDown, Settings2, Layers3, Info, Users,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode, accent, setAccent } = useTheme();
  const { studentClass, setStudentClass, resetStudentClass } = useStudentClass();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Notes', href: '/notes', icon: BookOpen },
    { label: 'Papers', href: '/previous-papers', icon: FileText },
    { label: 'Subjects', href: '/subjects', icon: Layers3 },
    { label: 'Tips', href: '/tips', icon: Lightbulb },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Contributors', href: '/contributors', icon: Users },
  ];

  const hrefWithClass = (href: string) =>
    studentClass ? `${href}${href.includes('?') ? '&' : '?'}class=${studentClass}` : href;

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  useEffect(() => {
    if (searchOpen) requestAnimationFrame(() => searchRef.current?.focus());
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
    setClassOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const changeClass = (level: 9 | 10 | 11 | 12) => {
    setClassOpen(false);
    setDrawerOpen(false);
    setStudentClass(level);
    router.replace(`${pathname}?class=${level}`, { scroll: false });
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = (searchRef.current?.value || '').trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    setSearchOpen(false);
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link href={studentClass ? `/?class=${studentClass}` : '/'} className="site-header__brand" aria-label="ARCHIVUM home">
            <span className="brand-logo">
              <img src={mode === 'dark' ? '/archivum-logo-light.png' : '/archivum-logo-dark.png'} alt="" className="w-[72%] h-[72%] object-contain" />
            </span>
            <span>
              <span className="site-header__wordmark">ARCHIVUM</span>
              <span className="brand-sister block text-[9px] mt-0.5">For SJS students</span>
            </span>
          </Link>

          <nav className="site-header__nav" aria-label="Primary navigation">
            {navLinks.map(item => (
              <Link
                key={item.href}
                href={hrefWithClass(item.href)}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            <div className="relative hidden sm:block">
              <button onClick={() => setClassOpen(v => !v)} className="class-switch" aria-expanded={classOpen}>
                <span>Class {studentClass || '—'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {classOpen && (
                <div className="absolute right-0 top-[44px] w-40 border bg-[var(--surface)] p-1.5 shadow-lg z-50" style={{borderColor:'var(--border)',borderRadius:'10px'}}>
                  {[9,10,11,12].map(level => (
                    <button
                      key={level}
                      onClick={() => changeClass(level as 9|10|11|12)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left text-sm"
                      style={{color: studentClass === level ? 'var(--accent)' : 'var(--ink)', background: studentClass === level ? 'var(--accent-light)' : 'transparent', borderRadius: '6px'}}
                    >
                      Class {level}
                      {studentClass === level && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setSearchOpen(v => !v)} className="icon-button header-icon" aria-label="Search">
              <Search />
            </button>
            <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} className="icon-button header-icon" aria-label="Toggle theme">
              {mode === 'dark' ? <Sun /> : <Moon />}
            </button>

            <Link href={hrefWithClass('/upload')} className="btn btn-primary hidden md:inline-flex">
              <Plus className="w-4 h-4" /> Upload
            </Link>

            <button onClick={() => setDrawerOpen(true)} className="icon-button header-icon md:hidden" aria-label="Open menu">
              <Menu />
            </button>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={submitSearch} className="absolute right-3 top-[calc(100%+8px)] z-50">
            <div className="site-search">
              <Search className="w-4 h-4 shrink-0" style={{color:'var(--ink-muted)'}} />
              <input ref={searchRef} placeholder="Search notes, papers, subjects or topics" aria-label="Search the archive" />
              <button type="button" className="btn-quiet" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </header>

      <div className={`fixed inset-0 z-[80] ${drawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} style={{opacity:drawerOpen?1:0,transition:'opacity .18s ease'}}>
        <button className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} aria-label="Close menu" />
        <aside
          className="absolute right-0 top-0 h-full w-[min(390px,92vw)] p-5 flex flex-col"
          style={{background:'var(--surface)',borderLeft:'1px solid var(--border)',transform:drawerOpen?'translateX(0)':'translateX(100%)',transition:'transform .24s ease'}}
        >
          <div className="flex items-center justify-between pb-4 border-b" style={{borderColor:'var(--border)'}}>
            <div className="site-header__brand">
              <span className="brand-logo"><img src={mode === 'dark' ? '/archivum-logo-light.png' : '/archivum-logo-dark.png'} alt="" className="w-[72%] h-[72%] object-contain" /></span>
              <span className="site-header__wordmark">ARCHIVUM</span>
            </div>
            <button onClick={() => setDrawerOpen(false)} className="icon-button header-icon" aria-label="Close menu"><X /></button>
          </div>

          <div className="flex-1 overflow-y-auto py-5">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {navLinks.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={hrefWithClass(item.href)}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm"
                    style={{color:isActive(item.href)?'var(--accent)':'var(--ink)',background:isActive(item.href)?'var(--accent-light)':'transparent',borderRadius:'7px'}}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-7 pt-5 border-t" style={{borderColor:'var(--border)'}}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-sm">Class profile</div>
                  <div className="text-xs mt-0.5" style={{color:'var(--ink-muted)'}}>Used to filter your archive.</div>
                </div>
                <Settings2 className="w-4 h-4" style={{color:'var(--accent)'}} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[9,10,11,12].map(level => (
                  <button key={level} onClick={() => changeClass(level as 9|10|11|12)} className="border py-2.5 text-xs font-medium" style={{borderColor:studentClass===level?'var(--accent)':'var(--border)',background:studentClass===level?'var(--accent-light)':'var(--surface)',color:studentClass===level?'var(--accent)':'var(--ink)',borderRadius:'7px'}}>
                    {level}
                  </button>
                ))}
              </div>
              <button onClick={() => { resetStudentClass(); setDrawerOpen(false); }} className="btn btn-secondary w-full mt-3">
                Reset class profile
              </button>
            </div>

            <div className="mt-7 pt-5 border-t" style={{borderColor:'var(--border)'}}>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4" style={{color:'var(--accent)'}} />
                <span className="font-semibold text-sm">Accent colour</span>
              </div>
              <div className="flex gap-2">
                {ACCENTS.map(item => (
                  <button key={item.id} onClick={() => setAccent(item.id)} className="w-8 h-8 border-2 flex items-center justify-center" style={{background:item.color,borderColor:accent===item.id?'var(--ink)':'transparent',borderRadius:'50%'}} aria-label={item.label}>
                    {accent===item.id && <Check className="w-4 h-4" style={{color:'#fff'}} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t text-xs" style={{borderColor:'var(--border)',color:'var(--ink-muted)'}}>
            Important syllabus and exam details should always be checked against the school or JKBOSE source.
          </div>
        </aside>
      </div>
    </>
  );
}
