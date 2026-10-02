'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, FileText, Bookmark, Timer } from 'lucide-react';
import { useStudentClass } from './StudentClassContext';
import { getSavedResourceIds } from '@/lib/savedStorage';

const NAVS = [
  { label: 'Home', base: '/', Icon: Home },
  { label: 'Notes', base: '/notes', Icon: BookOpen },
  { label: 'Papers', base: '/previous-papers', Icon: FileText },
  { label: 'Focus', base: '/focus', Icon: Timer },
  { label: 'Saved', base: '/saved', Icon: Bookmark },
] as const;

export default function MobileNav() {
  const pathname = usePathname();
  const { studentClass } = useStudentClass();
  const [hidden, setHidden] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const lastY = useRef(0);

  const withClass = (base: string) => (studentClass && base !== '/focus') ? `${base}?class=${studentClass}` : base;
  const isActive = (base: string) => base === '/' ? pathname === '/' : pathname.startsWith(base);
  const activeIndex = NAVS.findIndex(n => isActive(n.base));

  useEffect(() => {
    const sync = () => setSavedCount(getSavedResourceIds().length);
    sync();
    window.addEventListener('sjs_saved_updated', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('sjs_saved_updated', sync); window.removeEventListener('storage', sync); };
  }, []);

  // Slide away while reading downward, return the moment the student scrolls back up.
  useEffect(() => {
    lastY.current = window.scrollY;
    setHidden(false);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
        if (y < 80 || delta < -6 || nearBottom) setHidden(false);
        else if (delta > 10) setHidden(true);
        lastY.current = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const buzz = useCallback(() => { try { navigator.vibrate?.(8); } catch {} }, []);

  return (
    <nav className={`mobile-nav mn${hidden ? ' mn-hidden' : ''}`} aria-label="Primary">
      <div className="mn-track" style={{ ['--mn-i' as string]: Math.max(activeIndex, 0) }}>
        {activeIndex >= 0 && <span className="mn-pill" aria-hidden="true" />}
        {NAVS.map(({ label, base, Icon }) => {
          const active = isActive(base);
          return (
            <Link key={base} href={withClass(base)} onClick={buzz} aria-current={active ? 'page' : undefined} className={`mn-item${active ? ' on' : ''}`}>
              <span className="mn-icon">
                <Icon aria-hidden="true" />
                {base === '/saved' && savedCount > 0 && <b className="mn-badge" aria-label={`${savedCount} saved`}>{savedCount > 9 ? '9+' : savedCount}</b>}
              </span>
              <span className="mn-label">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
