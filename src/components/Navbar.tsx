'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme, ACCENTS } from './ThemeContext';
import { useStudentClass } from './StudentClassContext';
import { Search, Plus, Sun, Moon, X, Menu, BookOpen, FileText, Lightbulb, Palette, Check, ChevronRight, Settings2, Layers3, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mode, setMode, accent, setAccent } = useTheme();
  const { studentClass, setStudentClass, resetStudentClass } = useStudentClass();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => { document.body.style.overflow = drawerOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [drawerOpen]);
  useEffect(() => { setDrawerOpen(false); setPaletteOpen(false); setClassOpen(false); }, [pathname]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Notes', href: '/notes', icon: BookOpen },
    { label: 'Previous Papers', href: '/previous-papers', icon: FileText },
    { label: 'Subjects', href: '/subjects', icon: Layers3 },
    { label: 'Tips & Tricks', href: '/tips', icon: Lightbulb },
  ];
  const hrefWithClass = (href: string) => studentClass ? `${href}${href.includes('?') ? '&' : '?'}class=${studentClass}` : href;
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  const changeClass = (level: 9 | 10 | 11 | 12) => {
    setClassOpen(false);
    setDrawerOpen(false);
    setStudentClass(level);
    const params = new URLSearchParams(searchParams.toString());
    params.set('class', String(level));
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  return (
    <>
      <header className={`sticky top-3 sm:top-4 z-40 mx-2 sm:mx-4 lg:mx-6 rounded-[1.75rem] sm:rounded-[2rem] border transition-all duration-500 ${scrolled ? 'premium-shadow' : ''}`} style={{ background: 'color-mix(in srgb,var(--surface) 91%,transparent)', borderColor: 'color-mix(in srgb,var(--border) 85%,transparent)', backdropFilter: 'blur(26px) saturate(1.2)' }}>
        <div className="max-w-[1480px] mx-auto px-3 sm:px-5 lg:px-7 h-[72px] sm:h-[82px] flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 sm:gap-4 shrink-0 group" aria-label="ARCHIVUM home">
            <span className="w-11 h-11 sm:w-[54px] sm:h-[54px] rounded-full border-2 flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-105" style={{ borderColor: 'var(--ink)', color: 'var(--ink)', background: 'var(--surface)' }}>
              <span className="font-display text-[25px] sm:text-[30px] font-medium leading-none">A</span>
            </span>
            <span className="hidden xs:block">
              <span className="block font-display text-[17px] sm:text-[20px] font-medium tracking-[.18em] leading-none">ARCHIVUM</span>
              <span className="block text-[7px] sm:text-[8px] uppercase tracking-[.24em] mt-1.5 font-bold" style={{ color: 'var(--ink-faint)' }}>SJS STUDENT ARCHIVE</span>
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={hrefWithClass(item.href)} className="relative inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-semibold transition-all duration-300 hover:-translate-y-0.5" style={{ color: active ? 'var(--ink)' : 'var(--ink-muted)' }}>
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {item.label}
                  {active && <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative hidden lg:block">
              <button onClick={() => setClassOpen(v => !v)} className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full text-[10px] font-bold border transition-all duration-300 hover:-translate-y-0.5" style={{ background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'color-mix(in srgb,var(--accent) 24%,var(--border))' }} aria-label="Change class">
                <Layers3 className="w-3.5 h-3.5" /> CLASS {studentClass || '—'}
              </button>
              {classOpen && <div className="absolute right-0 top-12 w-44 rounded-2xl border p-2 shadow-2xl animate-fade" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <p className="px-2 py-1.5 text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--ink-faint)' }}>Your class</p>
                {[9,10,11,12].map(level => <button key={level} onClick={() => changeClass(level as 9|10|11|12)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--ink)' }}>Class {level}{studentClass === level && <Check className="w-4 h-4" style={{ color: 'var(--accent)' }} />}</button>)}
              </div>}
            </div>
            <button onClick={() => setSearchOpen(v => !v)} className="icon-button w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105" aria-label="Search"><Search className="w-[17px] h-[17px]" /></button>
            <span className="hidden sm:block w-px h-8 mx-1" style={{ background: 'var(--border)' }} />
            <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} className="icon-button w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105" aria-label="Toggle theme">{mode === 'dark' ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}</button>
            <div className="relative hidden sm:block">
              <button onClick={() => setPaletteOpen(v => !v)} className="icon-button w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105" aria-label="Accent theme"><Palette className="w-[17px] h-[17px]" style={{ color: 'var(--accent)' }} /></button>
              {paletteOpen && <div className="absolute right-0 top-14 w-56 rounded-2xl border p-2 shadow-2xl animate-fade" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <p className="px-2 py-1.5 text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--ink-faint)' }}>Accent</p>
                {ACCENTS.map(item => <button key={item.id} onClick={() => { setAccent(item.id); setPaletteOpen(false); }} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--ink)' }}><span className="w-4 h-4 rounded-full" style={{ background: item.color }} /><span className="flex-1 text-left">{item.label}</span>{accent === item.id && <Check className="w-4 h-4" style={{ color: 'var(--accent)' }} />}</button>)}
              </div>}
            </div>
            <Link href={hrefWithClass('/upload')} className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', boxShadow: '0 10px 28px var(--accent-glow)' }}><Plus className="w-4 h-4" /> Upload</Link>
            <button onClick={() => setDrawerOpen(true)} className="icon-button w-10 h-10 rounded-full md:flex xl:hidden items-center justify-center transition-transform hover:scale-105" aria-label="Open menu"><Menu className="w-5 h-5" /></button>
          </div>
        </div>

        {searchOpen && <div className="border-t rounded-b-[1.75rem] animate-fade" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}><form onSubmit={e => { e.preventDefault(); const q = (searchRef.current?.value || '').trim(); window.location.href = q ? `/search?q=${encodeURIComponent(q)}` : '/search'; }} className="max-w-7xl mx-auto px-4 sm:px-7 py-3.5 flex items-center gap-3"><Search className="w-4 h-4" style={{ color: 'var(--accent)' }} /><input ref={searchRef} className="flex-1 bg-transparent outline-none text-sm" placeholder="Search your class archive…" style={{ color: 'var(--ink)' }} /><button type="button" onClick={() => setSearchOpen(false)} className="p-2" style={{ color: 'var(--ink-muted)' }}><X className="w-4 h-4" /></button></form></div>}
      </header>

      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
        <aside className={`absolute right-0 top-0 h-full w-[88%] max-w-sm p-4 flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ background: 'var(--surface)' }}>
          <div className="flex items-center justify-between p-2 pb-5 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex items-center gap-2.5"><span className="w-10 h-10 rounded-full border flex items-center justify-center" style={{ borderColor: 'var(--ink)' }}><span className="font-display text-lg">A</span></span><div><div className="font-display font-semibold tracking-[.16em]">ARCHIVUM</div><div className="text-[9px] uppercase tracking-[.16em]" style={{ color: 'var(--ink-faint)' }}>SJS student archive</div></div></div>
            <button onClick={() => setDrawerOpen(false)} className="icon-button w-10 h-10 rounded-full flex items-center justify-center"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto py-5 space-y-6">
            <div className="space-y-1">{navLinks.map(item => { const Icon = item.icon; return <Link key={item.href} href={hrefWithClass(item.href)} onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3.5 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 hover:translate-x-1" style={{ background: isActive(item.href) ? 'var(--accent-light)' : 'transparent', color: isActive(item.href) ? 'var(--accent)' : 'var(--ink)' }}>{Icon && <Icon className="w-4 h-4" />}{item.label}<ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" /></Link>; })}</div>
            <Link href={hrefWithClass('/upload')} onClick={() => setDrawerOpen(false)} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-xs font-bold transition-transform active:scale-[.98]" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}><Plus className="w-4 h-4" /> Upload resource</Link>

            <div className="rounded-3xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-raised)' }}>
              <div className="flex items-center gap-2"><Settings2 className="w-4 h-4" style={{ color: 'var(--accent)' }} /><span className="text-xs font-bold">Your setup</span></div>
              <div className="flex items-center justify-between"><span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Class profile</span><strong className="text-xs">{studentClass ? `Class ${studentClass}` : 'Not set'}</strong></div>
              <div className="grid grid-cols-4 gap-1.5">
                {[9,10,11,12].map(level => <button key={level} onClick={() => changeClass(level as 9|10|11|12)} className="rounded-xl border py-2.5 text-[11px] font-bold transition-all duration-300" style={{ borderColor: studentClass === level ? 'var(--accent)' : 'var(--border)', background: studentClass === level ? 'var(--accent-light)' : 'var(--surface)', color: studentClass === level ? 'var(--accent)' : 'var(--ink)' }}>Class {level}</button>)}
              </div>
              <button onClick={() => { resetStudentClass(); setDrawerOpen(false); }} className="w-full rounded-2xl border py-2.5 text-[11px] font-bold transition-all hover:border-[var(--accent)]" style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}>Reset class profile</button>
            </div>

            <div className="rounded-3xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-raised)' }}>
              <div className="flex items-center gap-2 mb-3"><Palette className="w-4 h-4" style={{ color: 'var(--accent)' }} /><span className="text-xs font-bold">Theme accents</span></div>
              <div className="grid grid-cols-5 gap-2">{ACCENTS.map(item => <button key={item.id} onClick={() => setAccent(item.id)} className="h-9 rounded-xl border-2 flex items-center justify-center transition-transform hover:scale-105" style={{ background: item.color, borderColor: accent === item.id ? 'var(--ink)' : 'transparent' }} aria-label={item.label}>{accent === item.id && <Check className="w-4 h-4" style={{ color: '#fff' }} />}</button>)}</div>
            </div>
          </div>
          <div className="pt-4 border-t text-[10px] leading-relaxed" style={{ borderColor: 'var(--border-light)', color: 'var(--ink-faint)' }}>ARCHIVUM is a student resource archive. Cross-check important syllabus and exam information with official school or board sources.</div>
        </aside>
      </div>
    </>
  );
}
