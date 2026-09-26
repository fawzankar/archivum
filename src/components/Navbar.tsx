'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme, ACCENTS } from './ThemeContext';
import {
  Search, Plus, Sun, Moon, X, Menu, BookOpen, FileText, Bookmark,
  Info, Home, Palette, Check, ChevronRight
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { mode, setMode, accent, setAccent } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);
  useEffect(() => { setDrawerOpen(false); setPaletteOpen(false); }, [pathname]);

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Notes', href: '/notes', icon: BookOpen },
    { label: 'Papers', href: '/previous-papers', icon: FileText },
    { label: 'Subjects', href: '/search', icon: Search },
    { label: 'Our Story', href: '/about', icon: Info },
  ];

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}
        style={{
          backgroundColor: 'color-mix(in srgb, var(--surface) 92%, transparent)',
          borderColor: scrolled ? 'var(--border)' : 'var(--border-light)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-[70px] flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="SJS CONNECT home">
            <div
              className="w-9 h-9 rounded-[13px] flex items-center justify-center font-display font-bold text-[10px] tracking-tight transition-transform group-hover:-rotate-3 group-active:scale-95"
              style={{ border: '1.5px solid var(--ink)', color: 'var(--ink)', backgroundColor: 'var(--surface)' }}
            >
              SJS
            </div>
            <div className="hidden xs:flex flex-col">
              <span className="font-display font-bold tracking-tight text-[15px] leading-none" style={{ color: 'var(--ink)' }}>
                SJS CONNECT
              </span>
              <span className="text-[8px] font-semibold tracking-[0.16em] uppercase mt-1" style={{ color: 'var(--ink-faint)' }}>
                FIND · STUDY · SHARE
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-light)' }}>
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3.5 py-2 rounded-full text-[11px] font-semibold transition-all"
                  style={{
                    backgroundColor: active ? 'var(--surface)' : 'transparent',
                    color: active ? 'var(--ink)' : 'var(--ink-muted)',
                    boxShadow: active ? '0 1px 4px color-mix(in srgb, var(--ink) 8%, transparent)' : 'none',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setSearchOpen(!searchOpen)} className="icon-button w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer" title="Search" aria-label="Search">
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              className="icon-button w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
              title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative hidden md:block">
              <button
                onClick={() => setPaletteOpen(!paletteOpen)}
                className="icon-button w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
                title="Change accent"
                aria-label="Change accent color"
              >
                <Palette className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </button>
              {paletteOpen && (
                <div className="absolute right-0 top-11 w-56 rounded-2xl border p-2 shadow-xl animate-fade" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Accent</p>
                  {ACCENTS.map((item) => (
                    <button key={item.id} onClick={() => { setAccent(item.id); setPaletteOpen(false); }} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--ink)' }}>
                      <span className="w-4 h-4 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {accent === item.id && <Check className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/upload" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm hover:opacity-90 active:scale-95" style={{ backgroundColor: 'var(--ink)', color: 'var(--surface)' }}>
              <Plus className="w-3.5 h-3.5" />
              Upload
            </Link>

            <button onClick={() => setDrawerOpen(true)} className="md:hidden icon-button w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer" aria-label="Open navigation menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t animate-fade" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <form onSubmit={(e) => { e.preventDefault(); const q = (searchRef.current?.value || '').trim(); window.location.href = q ? `/search?q=${encodeURIComponent(q)}` : '/search'; setSearchOpen(false); }} className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
              <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--ink-faint)' }} />
              <input ref={searchRef} type="text" placeholder="Search notes, papers, subjects, classes..." className="flex-1 bg-transparent text-xs sm:text-sm outline-none font-medium" style={{ color: 'var(--ink)' }} />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2 rounded-lg cursor-pointer" style={{ color: 'var(--ink-muted)' }} aria-label="Close search"><X className="w-4 h-4" /></button>
            </form>
          </div>
        )}
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="relative ml-auto w-[88%] max-w-sm h-full flex flex-col shadow-2xl animate-fade" style={{ backgroundColor: 'var(--surface)', color: 'var(--ink)' }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[13px] flex items-center justify-center font-display font-bold text-[10px]" style={{ border: '1.5px solid var(--ink)', color: 'var(--ink)' }}>SJS</div>
                <div><h3 className="font-display font-bold text-sm">SJS CONNECT</h3><p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>JKBOSE Student App</p></div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="icon-button w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer" aria-label="Close menu"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3" style={{ color: 'var(--ink-faint)' }}>Navigation</span>
                {navLinks.map((item) => {
                  const Icon = item.icon; const active = isActive(item.href);
                  return <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-colors" style={{ backgroundColor: active ? 'var(--accent-light)' : 'transparent', color: active ? 'var(--accent)' : 'var(--ink)' }}><Icon className="w-4 h-4" /><span>{item.label}</span><ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" /></Link>;
                })}
                <Link href="/saved" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold" style={{ color: 'var(--ink)' }}><Bookmark className="w-4 h-4" /><span>Saved Resources</span><ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" /></Link>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3" style={{ color: 'var(--ink-faint)' }}>Appearance</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['light','dark'] as const).map((value) => (
                    <button key={value} onClick={() => setMode(value)} className="flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-semibold capitalize" style={{ borderColor: mode === value ? 'var(--accent)' : 'var(--border)', backgroundColor: mode === value ? 'var(--accent-light)' : 'var(--surface-raised)', color: mode === value ? 'var(--accent)' : 'var(--ink)' }}>
                      {value === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}{value}
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)' }}>
                  <div className="flex items-center gap-2 mb-2"><Palette className="w-4 h-4" style={{ color: 'var(--accent)' }} /><span className="text-xs font-bold">Accent</span></div>
                  <div className="flex flex-wrap gap-2">
                    {ACCENTS.map((item) => (
                      <button key={item.id} onClick={() => setAccent(item.id)} className="w-9 h-9 rounded-xl border-2 flex items-center justify-center" style={{ backgroundColor: item.color, borderColor: accent === item.id ? 'var(--ink)' : 'transparent' }} title={item.label} aria-label={item.label}>
                        {accent === item.id && <Check className="w-4 h-4" style={{ color: '#fff' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[9,10,11,12].map((lvl) => <Link key={lvl} href={`/notes?class=${lvl}`} onClick={() => setDrawerOpen(false)} className="p-3 rounded-xl border text-center text-xs font-semibold" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)', color: 'var(--ink)' }}>Class {lvl}</Link>)}
              </div>

              <Link href="/upload" onClick={() => setDrawerOpen(false)} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-xs font-bold" style={{ backgroundColor: 'var(--ink)', color: 'var(--surface)' }}>
                <Plus className="w-4 h-4" /><span>Upload Resource</span>
              </Link>
            </div>

            <div className="p-4 border-t text-[11px]" style={{ borderColor: 'var(--border-light)', color: 'var(--ink-faint)' }}>
              <div className="flex items-center justify-between"><span>Classes 9–12 · JKBOSE</span><Link href="/about" onClick={() => setDrawerOpen(false)} className="font-semibold" style={{ color: 'var(--accent)' }}>Our Story →</Link></div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
