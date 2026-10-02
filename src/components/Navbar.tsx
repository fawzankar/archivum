'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme, ACCENTS, type Accent } from './ThemeContext';
import { useStudentClass } from './StudentClassContext';
import SearchBar from './SearchBar';
import { Search, X, ChevronRight, Home, BookOpen, FileText, Info, Users, RotateCcw, MessageCircle, ArrowUpRight, Timer, Bookmark } from 'lucide-react';
import { getSavedResourceIds } from '@/lib/savedStorage';

const tiles = [
  ['Notes', 'Chapter by chapter', '/notes', BookOpen],
  ['Papers', 'Practise the real thing', '/previous-papers', FileText],
  ['Focus', 'Study timer', '/focus', Timer],
  ['Saved', 'Your bookmarks', '/saved', Bookmark],
] as const;
const more = [
  ['Home', '/', Home], ['Contributors', '/contributors', Users],
  ['Contact us', '/contact', MessageCircle], ['About ARCHIVUM', '/about', Info],
] as const;
const prefetchList = ['/notes', '/previous-papers', '/focus', '/saved'];
const CLASSES = [9, 10, 11, 12] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { accent, setAccent, mode, setMode } = useTheme();
  const { studentClass: ctxClass, setStudentClass, displayName: ctxName, resetStudentProfile } = useStudentClass();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  // Saved profile details only exist in the browser, so wait for mount to keep server and client HTML identical.
  const studentClass = mounted ? ctxClass : null;
  const displayName = mounted ? ctxName : '';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawerOpen || searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen, searchOpen]);
  useEffect(() => { setDrawerOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    // Warm the main routes so switching sections feels immediate after the first visit.
    for (const href of prefetchList) router.prefetch(href);
  }, [router]);

  useEffect(() => {
    const sync = () => setSavedCount(getSavedResourceIds().length);
    sync();
    window.addEventListener('sjs_saved_updated', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('sjs_saved_updated', sync); window.removeEventListener('storage', sync); };
  }, []);
  useEffect(() => {
    if (!drawerOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

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
          <button className="header-menu" onClick={() => setDrawerOpen(true)} aria-label="Open menu" aria-expanded={drawerOpen}><span className="dr-burger" aria-hidden="true"><i /><i /><i /></span></button>
        </div>
      </div>

      {searchOpen && (
        <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search ARCHIVUM">
          <button className="search-modal-backdrop" type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" />
          <div className="search-modal-card">
            <div className="search-modal-head">
              <div>
                <span className="search-modal-kicker">ARCHIVUM</span>
                <h2>What are you looking for?</h2>
                <p>Looking for a chapter, a topic or a paper? Type it in.</p>
              </div>
              <button className="search-modal-close" type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X /></button>
            </div>
            <SearchBar className="header-search-bar" onSearch={() => setSearchOpen(false)} autoFocus showRecent />
          </div>
        </div>
      )}
    </header>

    <div className={`dr-layer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen}>
      <button type="button" className="dr-scrim" onClick={() => setDrawerOpen(false)} aria-label="Close menu" tabIndex={drawerOpen ? 0 : -1} />
      <aside className="dr-panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="dr-top">
          <span className="dr-brand"><span className="brand-logo"><span className="archivum-css-logo" /></span><strong>ARCHIVUM</strong></span>
          <button ref={closeRef} type="button" className="dr-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu"><X /></button>
        </div>

        <div className="dr-scroll">
          <section className="dr-profile" style={{ ['--d' as string]: 0 }}>
            <div className="dr-who">
              <span className="dr-avatar" aria-hidden="true">{(displayName || 'S').charAt(0).toUpperCase()}</span>
              <div>
                <strong>{displayName ? `Hi, ${displayName.split(' ')[0]}` : 'Hi there'}</strong>
                <small>{studentClass ? `You’re studying Class ${studentClass}` : 'Pick your class below'}</small>
              </div>
            </div>
            <div className="dr-classes" role="group" aria-label="Switch class">
              {CLASSES.map(level => (
                <button key={level} type="button" className={studentClass === level ? 'on' : ''} aria-pressed={studentClass === level}
                  onClick={() => { if (studentClass !== level) setStudentClass(level); setDrawerOpen(false); }}>
                  <small>Class</small>{level}
                </button>
              ))}
            </div>
          </section>

          <nav className="dr-tiles" aria-label="Study sections">
            {tiles.map(([label, hint, href, Icon], i) => (
              <Link key={href} href={withClass(href)} onClick={() => setDrawerOpen(false)} className={`dr-tile${active(href) ? ' on' : ''}`} style={{ ['--d' as string]: i + 1 }}>
                <span className="dr-tile-icon"><Icon aria-hidden="true" />{href === '/saved' && savedCount > 0 && <b>{savedCount > 9 ? '9+' : savedCount}</b>}</span>
                <strong>{label}</strong>
                <small>{hint}</small>
              </Link>
            ))}
          </nav>

          <nav className="dr-list" aria-label="More">
            {more.map(([label, href, Icon], i) => (
              <Link key={href} href={withClass(href)} onClick={() => setDrawerOpen(false)} className={active(href) ? 'on' : ''} style={{ ['--d' as string]: i + 5 }}>
                <Icon aria-hidden="true" /><span>{label}</span><ChevronRight aria-hidden="true" />
              </Link>
            ))}
          </nav>

          <section className="dr-colours" style={{ ['--d' as string]: 10 }}>
            <span className="dr-label">Make it yours</span>
            <div className="dr-swatches">
              {ACCENTS.map(item => (
                <button key={item.id} type="button" title={item.label} aria-label={`Use the ${item.label} colour`} aria-pressed={accent === item.id}
                  onClick={() => setAccent(item.id as Accent)} className={accent === item.id ? 'on' : ''}>
                  <span style={{ background: item.color }} />
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="dr-foot">
          <a className="dr-quest" href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer">
            <span><small>Our sister community</small><strong>Visit <span className="quest-word">QUEST</span></strong></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <div className="dr-foot-row">
            <button type="button" className="dr-reset" onClick={() => { resetStudentProfile(); setDrawerOpen(false); router.replace('/'); }}><RotateCcw aria-hidden="true" /> Start over</button>
            <span className="dr-credit">Built by <a href="https://linktr.ee/fawzankar" target="_blank" rel="noopener noreferrer">Fawzan Kar</a></span>
          </div>
        </div>
      </aside>
    </div>
  </>;
}
