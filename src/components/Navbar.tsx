'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme, ACCENTS, type Accent } from './ThemeContext';
import { useStudentClass } from './StudentClassContext';
import { Search, Plus, Sun, Moon, X, Menu, Home, BookOpen, FileText, Lightbulb, Palette, Check, ChevronDown, Settings2, Layers3, Info, Users } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode, accent, setAccent } = useTheme();
  const { studentClass, setStudentClass, resetStudentClass } = useStudentClass();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

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

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Notes', href: '/notes', icon: BookOpen },
    { label: 'Previous Papers', href: '/previous-papers', icon: FileText },
    { label: 'Subjects', href: '/subjects', icon: Layers3 },
    { label: 'Tips & Tricks', href: '/tips', icon: Lightbulb },
    { label: 'About Us', href: '/about', icon: Info },
    { label: 'Contributors', href: '/contributors', icon: Users },
  ];

  const hrefWithClass = (href: string) => studentClass ? `${href}${href.includes('?') ? '&' : '?'}class=${studentClass}` : href;
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  const changeClass = (level: 9 | 10 | 11 | 12) => {
    setClassOpen(false);
    setDrawerOpen(false);
    setStudentClass(level);
    router.replace(`${pathname}?class=${level}`, { scroll: false });
    router.refresh();
  };

  const chooseAccent = (id: Accent) => setAccent(id);

  return (
    <>
      <header className="premium-header relative sticky top-0 z-40 border-b" style={{ background: 'color-mix(in srgb,var(--surface) 96%,transparent)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1480px] mx-auto px-4 sm:px-7 lg:px-8 h-[66px] flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="ARCHIVUM home">
            <span className="brand-logo w-9 h-9 flex items-center justify-center"><span aria-hidden="true" className="archivum-css-logo w-[76%] h-[76%]" /></span>
            <span className="hidden sm:block"><span className="block font-display text-[15px] tracking-[.12em] leading-none">ARCHIVUM</span><span className="brand-sister block text-[7px] mt-1">Sister organisation of <span className="quest-word">QUEST</span></span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-5" aria-label="Primary navigation">
            {navLinks.slice(0, 5).map(item => <Link key={item.href} href={hrefWithClass(item.href)} className={`premium-nav-link ${isActive(item.href) ? 'is-active' : ''}`}>{item.label}</Link>)}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <button onClick={() => setClassOpen(v => !v)} className="premium-header-control" aria-label="Change class" aria-expanded={classOpen}>
                <Layers3 className="w-4 h-4" /><span>{studentClass ? `Class ${studentClass}` : 'Choose class'}</span><ChevronDown className={`w-3.5 h-3.5 transition-transform ${classOpen ? 'rotate-180' : ''}`} />
              </button>
              {classOpen && <div className="absolute right-0 top-[calc(100%+10px)] w-44 border p-2 shadow-xl" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <p className="px-2 py-2 text-xs" style={{ color: 'var(--ink-muted)' }}>Study profile</p>
                {[9, 10, 11, 12].map(level => <button key={level} onClick={() => changeClass(level as 9|10|11|12)} className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-[var(--surface-raised)]" style={{ color: 'var(--ink)' }}>Class {level}{studentClass === level && <Check className="w-4 h-4" style={{ color: 'var(--accent)' }} />}</button>)}
              </div>}
            </div>

            <button onClick={() => setSearchOpen(v => !v)} className="premium-icon-button" aria-label="Search"><Search /></button>
            <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} className="premium-icon-button hidden sm:flex" aria-label="Toggle theme">{mode === 'dark' ? <Sun /> : <Moon />}</button>
            <Link href={hrefWithClass('/upload')} className="premium-header-upload hidden sm:inline-flex"><Plus className="w-4 h-4" /> Upload</Link>
            <button onClick={() => setDrawerOpen(true)} className="premium-icon-button lg:hidden" aria-label="Open menu"><Menu /></button>
          </div>
        </div>

        {searchOpen && <form onSubmit={e => { e.preventDefault(); const q = (searchRef.current?.value || '').trim(); router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search'); setSearchOpen(false); }} className="absolute top-[calc(100%+8px)] right-4 sm:right-7 w-[min(520px,calc(100vw-2rem))] premium-search p-2 flex items-center gap-2 shadow-xl">
          <Search className="w-4 h-4 ml-2" style={{ color: 'var(--accent)' }} /><input ref={searchRef} className="flex-1 min-w-0 bg-transparent outline-none text-sm px-2 py-2" placeholder="Search the archive" style={{ color: 'var(--ink)' }} /><button type="button" onClick={() => setSearchOpen(false)} className="premium-icon-button !w-8 !h-8" aria-label="Close search"><X /></button>
        </form>}
      </header>

      <div className={`fixed inset-0 z-50 transition-opacity duration-200 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/45" onClick={() => setDrawerOpen(false)} />
        <aside className={`absolute right-0 top-0 h-full w-[90%] max-w-[440px] flex flex-col shadow-2xl transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3"><span className="brand-logo w-9 h-9 flex items-center justify-center"><span aria-hidden="true" className="archivum-css-logo w-[76%] h-[76%]" /></span><div><div className="font-display tracking-[.12em]">ARCHIVUM</div><div className="brand-sister text-[7px] mt-1">Sister organisation of <span className="quest-word">QUEST</span></div></div></div>
            <button onClick={() => setDrawerOpen(false)} className="premium-icon-button" aria-label="Close menu"><X /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <nav className="space-y-1">{navLinks.map(item => { const Icon = item.icon; return <Link key={item.href} href={hrefWithClass(item.href)} onClick={() => setDrawerOpen(false)} className={`premium-drawer-link ${isActive(item.href) ? 'is-active' : ''}`}><Icon className="w-4 h-4" />{item.label}</Link>; })}</nav>
            <div className="mt-8 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 mb-4"><Settings2 className="w-4 h-4" style={{ color: 'var(--accent)' }} /><span className="text-sm font-semibold">Study profile</span></div>
              <div className="grid grid-cols-4 gap-2">{[9,10,11,12].map(level => <button key={level} onClick={() => changeClass(level as 9|10|11|12)} className="border py-3 text-xs" style={{ borderColor: studentClass === level ? 'var(--accent)' : 'var(--border)', background: studentClass === level ? 'var(--accent-light)' : 'var(--surface)', color: studentClass === level ? 'var(--accent)' : 'var(--ink)' }}>Class {level}</button>)}</div>
              <button onClick={() => { resetStudentClass(); setDrawerOpen(false); }} className="w-full mt-3 border py-3 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--ink-muted)' }}>Reset class profile</button>
            </div>
            <div className="mt-8 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 mb-4"><Palette className="w-4 h-4" style={{ color: 'var(--accent)' }} /><span className="text-sm font-semibold">Accent</span></div>
              <div className="flex gap-3">{ACCENTS.map(item => <button key={item.id} onClick={() => chooseAccent(item.id)} className="w-9 h-9 border-2 flex items-center justify-center" style={{ background: item.color, borderColor: accent === item.id ? 'var(--ink)' : 'transparent' }} aria-label={item.label}>{accent === item.id && <Check className="w-4 h-4" style={{ color: '#fff' }} />}</button>)}</div>
            </div>
            <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="mt-8 block border-t pt-6 text-sm font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>Visit SJS QUEST</a>
          </div>
          <div className="px-5 py-4 border-t text-[11px] leading-5" style={{ borderColor: 'var(--border)', color: 'var(--ink-faint)' }}>Built for SJS students to keep useful study material close at hand.</div>
        </aside>
      </div>
    </>
  );
}
