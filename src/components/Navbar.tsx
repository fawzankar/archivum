'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme, ACCENTS } from './ThemeContext';
import { useStudentClass } from './StudentClassContext';
import {
  Search, Plus, Sun, Moon, X, Menu, Home, BookOpen, FileText, Lightbulb,
  Palette, Check, ChevronRight, Settings2, Layers3, Info, Users,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode, accent, setAccent } = useTheme();
  const { studentClass, setStudentClass, resetStudentClass } = useStudentClass();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Warm all four class home routes once, quietly, after first paint.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      [9, 10, 11, 12].forEach(level => router.prefetch(`/?class=${level}`));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (searchOpen) requestAnimationFrame(() => searchRef.current?.focus());
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
    setPaletteOpen(false);
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

  const hrefWithClass = (href: string) =>
    studentClass ? `${href}${href.includes('?') ? '&' : '?'}class=${studentClass}` : href;

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  const changeClass = (level: 9 | 10 | 11 | 12) => {
    setClassOpen(false);
    setDrawerOpen(false);
    setStudentClass(level);
    router.replace(`${pathname}?class=${level}`, { scroll: false });
  };

  return (
    <>
      <header
        className={`relative sticky top-2 sm:top-3 z-40 mx-2 sm:mx-4 lg:mx-6 rounded-[1.45rem] sm:rounded-[1.75rem] border transition-[box-shadow,background,border-color] duration-200 ${scrolled ? 'premium-shadow' : ''}`}
        style={{
          background: 'var(--surface)',
          borderColor: 'color-mix(in srgb,var(--accent) 28%,var(--border))',
          
          boxShadow: scrolled ? '0 10px 28px color-mix(in srgb,var(--ink) 10%,transparent)' : '0 4px 16px color-mix(in srgb,var(--ink) 6%,transparent)',
        }}
      >
        <div className="max-w-[1480px] mx-auto px-2.5 sm:px-4 lg:px-5 h-[54px] sm:h-[60px] flex items-center justify-between gap-2.5">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group min-w-0" aria-label="ARCHIVUM home">
            <span className="brand-logo w-8 h-8 sm:w-9 sm:h-9 rounded-[11px] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:-rotate-2 group-hover:scale-105">
              <span aria-hidden="true" className="archivum-css-logo w-[78%] h-[78%]" />
            </span>
            <span className="block min-w-0">
              <span className="block font-display text-[12px] sm:text-[14px] tracking-[.16em] leading-none whitespace-nowrap">ARCHIVUM</span>
              <span className="brand-sister block text-[6.5px] sm:text-[7px] uppercase tracking-[.13em] mt-1 whitespace-nowrap">SISTER ORGANISATION OF <span className="quest-word">QUEST</span></span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            <div className="relative hidden md:block">
              <button
                onClick={() => setClassOpen(v => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] border transition-colors hover:border-[var(--accent)]"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'color-mix(in srgb,var(--accent) 30%,var(--border))' }}
                aria-label="Change class"
              >
                <Layers3 className="w-3.5 h-3.5" /> CLASS {studentClass || '—'}
              </button>
              {classOpen && (
                <div className="absolute right-0 top-11 w-40 rounded-2xl border p-2 shadow-2xl animate-fade" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <p className="px-2 py-1.5 text-[9px] uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Your class</p>
                  {[9, 10, 11, 12].map(level => (
                    <button key={level} onClick={() => changeClass(level as 9|10|11|12)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--ink)' }}>
                      Class {level}{studentClass === level && <Check className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
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

            <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] transition-colors" style={{ color:'var(--accent)', background:'var(--accent-light)' }}>
              <span className="quest-word">VISIT QUEST</span> <ChevronRight className="w-3 h-3" />
            </a>
            <Link href={hrefWithClass('/upload')} className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] transition-all hover:-translate-y-0.5" style={{ background:'var(--accent)', color:'var(--accent-contrast)', boxShadow:'0 9px 24px var(--accent-glow)' }}>
              <Plus className="w-3.5 h-3.5" /> Upload
            </Link>

            <button
              onClick={() => setDrawerOpen(true)}
              className="icon-button header-icon menu-circle"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <Menu />
            </button>
          </div>
        </div>

        {searchOpen && (
          <form
            onSubmit={e => {
              e.preventDefault();
              const q = (searchRef.current?.value || '').trim();
              router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
              setSearchOpen(false);
            }}
            className="absolute right-2 sm:right-3 top-[calc(100%+8px)] w-[calc(100%-1rem)] sm:w-[min(480px,calc(100vw-2rem))] rounded-xl border px-3 py-2 shadow-2xl animate-fade flex items-center gap-2.5"
            style={{ background:'color-mix(in srgb,var(--surface) 82%,var(--accent-light) 18%)', borderColor:'color-mix(in srgb,var(--accent) 28%,var(--border))',  }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color:'var(--accent)' }} />
            <input ref={searchRef} className="min-w-0 flex-1 bg-transparent outline-none text-xs sm:text-sm" placeholder="Search the archive…" style={{ color:'var(--ink)' }} />
            <button type="button" onClick={() => setSearchOpen(false)} className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ color:'var(--ink-muted)' }} aria-label="Close search"><X className="w-4 h-4" /></button>
          </form>
        )}
      </header>

      <div className={`fixed inset-0 z-50 transition-opacity duration-200 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/45" onClick={() => setDrawerOpen(false)} />
        <aside className={`absolute right-0 top-0 h-full w-[88%] max-w-[420px] p-4 flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ background:'var(--surface)', borderLeft:'1px solid var(--border)' }}>
          <div className="flex items-center justify-between p-2 pb-5 border-b" style={{ borderColor:'var(--border-light)' }}>
            <div className="flex items-center gap-2.5">
              <span className="brand-logo w-10 h-10 rounded-[13px] flex items-center justify-center"><span aria-hidden="true" className="archivum-css-logo w-[78%] h-[78%]" /></span>
              <div><div className="font-display tracking-[.16em]">ARCHIVUM</div><div className="brand-sister text-[8px] uppercase tracking-[.13em]"><span>SISTER ORGANISATION OF </span><span className="quest-word">QUEST</span></div></div>
            </div>
            <button onClick={() => setDrawerOpen(false)} className="icon-button header-icon" aria-label="Close menu"><X /></button>
          </div>

          <div className="flex-1 overflow-y-auto py-5 space-y-5">
            <div className="space-y-1">
              {navLinks.map(item => {
                const Icon = item.icon;
                return <Link key={item.href} href={hrefWithClass(item.href)} onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs transition-colors" style={{ background:isActive(item.href)?'var(--accent-light)':'transparent', color:isActive(item.href)?'var(--accent)':'var(--ink)' }}>{Icon && <Icon className="w-4 h-4" />}{item.label}<ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" /></Link>;
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 py-3 rounded-2xl border text-xs" style={{borderColor:'color-mix(in srgb,var(--accent) 28%,var(--border))',color:'var(--accent)',background:'var(--accent-light)'}}><span className="quest-word">VISIT QUEST</span> <ChevronRight className="w-3.5 h-3.5" /></a>
              <Link href={hrefWithClass('/upload')} onClick={() => setDrawerOpen(false)} className="inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-xs" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}><Plus className="w-3.5 h-3.5" /> Upload</Link>
            </div>

            <div className="rounded-xl border p-4 space-y-3" style={{borderColor:'var(--border)',background:'var(--surface-raised)'}}>
              <div className="flex items-center gap-2"><Settings2 className="w-4 h-4" style={{color:'var(--accent)'}} /><span className="text-xs">Your setup</span></div>
              <div className="flex items-center justify-between"><span className="text-xs" style={{color:'var(--ink-muted)'}}>Class profile</span><span className="text-xs">{studentClass ? `Class ${studentClass}` : 'Not set'}</span></div>
              <div className="grid grid-cols-4 gap-1.5">
                {[9,10,11,12].map(level => <button key={level} onClick={() => changeClass(level as 9|10|11|12)} className="rounded-xl border py-2.5 text-[11px] transition-all" style={{borderColor:studentClass===level?'var(--accent)':'var(--border)',background:studentClass===level?'var(--accent-light)':'var(--surface)',color:studentClass===level?'var(--accent)':'var(--ink)'}}>Class {level}</button>)}
              </div>
              <button onClick={() => { resetStudentClass(); setDrawerOpen(false); }} className="w-full rounded-2xl border py-2.5 text-[11px]" style={{borderColor:'var(--border)',color:'var(--ink)'}}>Reset class profile</button>
            </div>

            <div className="rounded-xl border p-4" style={{borderColor:'var(--border)',background:'var(--surface-raised)'}}>
              <div className="flex items-center gap-2 mb-3"><Palette className="w-4 h-4" style={{color:'var(--accent)'}} /><span className="text-xs">Theme accents</span></div>
              <div className="grid grid-cols-5 gap-2">{ACCENTS.map(item => <button key={item.id} onClick={() => setAccent(item.id)} className="h-9 rounded-xl border-2 flex items-center justify-center transition-transform hover:scale-105" style={{background:item.color,borderColor:accent===item.id?'var(--ink)':'transparent'}} aria-label={item.label}>{accent===item.id && <Check className="w-4 h-4" style={{color:'#fff'}} />}</button>)}</div>
            </div>
          </div>

          <div className="pt-4 border-t text-[10px] leading-relaxed" style={{borderColor:'var(--border-light)',color:'var(--ink-faint)'}}>ARCHIVUM is a student resource archive. Cross-check important syllabus and exam information with official school or board sources.</div>
        </aside>
      </div>
    </>
  );
}
