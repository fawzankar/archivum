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
    const locked = drawerOpen || searchOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    document.documentElement.classList.toggle('archivum-overlay-open', locked);
    return () => {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('archivum-overlay-open');
    };
  }, [drawerOpen, searchOpen]);
  useEffect(() => { setDrawerOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    // Warm the main routes so switching sections feels immediate after the first visit.
    for (const [, href] of links) router.prefetch(href);
  }, [router]);

  const withClass = (href: string) => studentClass ? `${href}${href.includes('?') ? '&' : '?'}class=${studentClass}` : href;
  const active = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return <>
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="archive-shell site-header-inner">
        <Link href="/" className="brand-lockup" aria-label="ARCHIVUM home">
          <span className="brand-logo"><span className="archivum-css-logo" /></span>
          <span><strong>ARCHIVUM</strong><small>A Sister Organization Of <span className="quest-word">Quest</span></small></span>
        </Link>

        <div className="header-actions">
          <button className="header-action search-trigger" onClick={() => setSearchOpen(v => !v)} aria-label="Search"><Search /></button>
          <button className="header-menu" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Menu /></button>
        </div>
      </div>

      {searchOpen && (
        <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search ARCHIVUM">
          <button className="search-modal-backdrop" type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" />
          <div className="search-modal-card">
            <div className="search-modal-head">
              <div>
                <span className="search-modal-kicker">ARCHIVUM</span>
                <h2>Search the archive</h2>
                <p>Find notes, papers and study material.</p>
              </div>
              <button className="search-modal-close" type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X /></button>
            </div>
            <SearchBar className="header-search-bar" onSearch={() => setSearchOpen(false)} autoFocus />
          </div>
        </div>
      )}
    </header>

    <div className={`menu-layer ${drawerOpen ? 'open' : ''}`}>
      <button className="menu-scrim" onClick={() => setDrawerOpen(false)} aria-label="Close menu" />
      <aside className="menu-drawer">
        <div className="menu-top">
          <div className="brand-lockup"><span className="brand-logo"><span className="archivum-css-logo" /></span><span><strong>ARCHIVUM</strong><small>A Sister Organization Of <span className="quest-word">Quest</span></small></span></div>
          <button className="header-action" onClick={() => setDrawerOpen(false)} aria-label="Close menu"><X /></button>
        </div>

        <div className="menu-scroll">
          {displayName && <div className="menu-welcome"><span className="menu-welcome-mark">{displayName.charAt(0).toUpperCase()}</span><div><strong>Hello, {displayName}</strong><small>Class {studentClass || 'Not selected'}</small></div></div>}
          <div className="menu-section-label">Explore</div>
          <div className="menu-links">{links.map(([label,href,Icon]) => <Link key={href} href={withClass(href)} onClick={() => setDrawerOpen(false)} className={active(href) ? 'active' : ''}><Icon /><span>{label}</span><ChevronRight /></Link>)}</div>

          <div className="menu-section menu-appearance">
            <div className="menu-section-label">Colour Theme</div>
            <div className="accent-grid">{ACCENTS.map(item => <button key={item.id} type="button" title={item.label} aria-label={`Use ${item.label} colour`} onClick={() => setAccent(item.id as Accent)} className={`accent-swatch ${accent === item.id ? 'active' : ''}`}><span style={{ backgroundColor: item.color }} /><small>{item.label}</small></button>)}</div>
          </div>

          <button type="button" className="profile-reset" onClick={() => { resetStudentProfile(); setDrawerOpen(false); router.replace('/'); }}><RotateCcw /> Reset My Profile</button>
        </div>

          <div className="menu-quest-cta">
            <a className="quest-visit-link" href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer"><span>Visit <span className="quest-word">QUEST</span></span><ExternalLink /></a>
          </div>
        <div className="menu-note"><a href="https://linktr.ee/fawzankar" target="_blank" rel="noopener noreferrer">This App Is Built By Fawzan Kar</a></div>
      </aside>
    </div>
  </>;
}
