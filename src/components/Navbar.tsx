'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme, ACCENTS, type Accent } from './ThemeContext';
import { useStudentClass } from './StudentClassContext';
import SearchBar from './SearchBar';
import { Search, X, Menu, ChevronRight, Home, BookOpen, FileText, Lightbulb, Info, Users, RotateCcw, MessageCircle, ExternalLink } from 'lucide-react';

const links = [
  ['Home','/',Home], ['Notes','/notes',BookOpen], ['Previous Papers','/previous-papers',FileText],
  ['Tips & Tricks','/tips',Lightbulb], ['Contributors','/contributors',Users], ['Contact us','/contact',MessageCircle], ['About','/about',Info]
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { accent, setAccent, mode, setMode } = useTheme();
  const { studentClass, displayName, resetStudentProfile } = useStudentClass();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);
  useEffect(() => { setDrawerOpen(false); setSearchOpen(false); }, [pathname]);

  const withClass = (href: string) => studentClass ? `${href}${href.includes('?') ? '&' : '?'}class=${studentClass}` : href;
  const active = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return <>
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="archive-shell site-header-inner">
        <Link href="/" className="brand-lockup" aria-label="ARCHIVUM home">
          <span className="brand-logo"><span className="archivum-css-logo" /></span>
          <span><strong>ARCHIVUM</strong><small>A Sister Organization Of Quest</small></span>
        </Link>

        <div className="header-actions">
          <button className="header-action search-trigger" onClick={() => setSearchOpen(v => !v)} aria-label="Search"><Search /></button>
          <button className="header-menu" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Menu /></button>
        </div>
      </div>

      {searchOpen && <div className="header-search">
        <div className="archive-shell"><div className="header-search-field"><SearchBar className="header-search-bar" onSearch={() => setSearchOpen(false)} /><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X /></button></div></div>
      </div>}
    </header>

    <div className={`menu-layer ${drawerOpen ? 'open' : ''}`}>
      <button className="menu-scrim" onClick={() => setDrawerOpen(false)} aria-label="Close menu" />
      <aside className="menu-drawer">
        <div className="menu-top">
          <div className="brand-lockup"><span className="brand-logo"><span className="archivum-css-logo" /></span><span><strong>ARCHIVUM</strong><small>A Sister Organization Of Quest</small></span></div>
          <button className="header-action" onClick={() => setDrawerOpen(false)} aria-label="Close menu"><X /></button>
        </div>

        <div className="menu-scroll">
          {displayName && <div className="menu-welcome"><span className="menu-welcome-mark">{displayName.charAt(0).toUpperCase()}</span><div><strong>Hello, {displayName}</strong><small>Class {studentClass || '—'}</small></div></div>}
          <div className="menu-section-label">Explore</div>
          <div className="menu-links">{links.map(([label,href,Icon]) => <Link key={href} href={withClass(href)} onClick={() => setDrawerOpen(false)} className={active(href) ? 'active' : ''}><Icon /><span>{label}</span><ChevronRight /></Link>)}</div>

          <div className="menu-section">
            <div className="menu-section-label">Your class</div>
            <div className="class-grid">{[9,10,11,12].map(level => <Link key={level} href={`/?class=${level}`} onClick={() => setDrawerOpen(false)} className={studentClass === level ? 'active' : ''}>Class {level}</Link>)}</div>
          </div>

          <div className="menu-section menu-appearance">
            <div className="menu-section-label">Colour theme</div>
            <div className="accent-grid">{ACCENTS.map(item => <button key={item.id} type="button" title={item.label} aria-label={`Use ${item.label} colour`} onClick={() => setAccent(item.id as Accent)} className={`accent-swatch ${accent === item.id ? 'active' : ''}`}><span style={{ background: item.color }} /><small>{item.label}</small></button>)}</div>
          </div>

          {displayName && <button type="button" className="profile-reset" onClick={() => { resetStudentProfile(); setDrawerOpen(false); router.replace('/'); }}><RotateCcw /> Reset my profile</button>}
        </div>

          <div className="menu-quest-cta">
            <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer"><span><strong>Visit SJS Quest</strong><small>Explore the Quest community</small></span><ExternalLink /></a>
          </div>
        <div className="menu-note">Developed by Fawzan Kar</div>
      </aside>
    </div>
  </>;
}
