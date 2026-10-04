'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AHome as Home, ABook as BookOpen, AFile as FileText, ABookmark as Bookmark, AInfo as Info } from '@/components/AnimatedIcons';
import { useStudentClass } from './StudentClassContext';

const NAVS = [['Home', '/', Home], ['Notes', '/notes', BookOpen], ['Papers', '/previous-papers', FileText], ['Saved', '/saved', Bookmark], ['About', '/about', Info]] as const;

const isActive = (base: string, pathname: string) => (base === '/' ? pathname === '/' : pathname.startsWith(base));

export default function MobileNav() {
  const pathname = usePathname();
  const { studentClass } = useStudentClass();
  const [profileReady, setProfileReady] = useState(false);
  useEffect(() => { setProfileReady(true); }, []);

  const current = NAVS.findIndex(([, base]) => isActive(base, pathname));
  // On pages that aren't a tab (search, contact...) the pill stays where it was and fades out.
  const [shown, setShown] = useState(Math.max(current, 0));
  useEffect(() => { if (current > -1) setShown(current); }, [current]);

  const visibleStudentClass = profileReady ? studentClass : null;
  const href = (base: string) => (visibleStudentClass ? `${base}?class=${visibleStudentClass}` : base);

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <div className="mobile-nav-inner" style={{ ['--i' as string]: shown }}>
        <span className={'mobile-nav-pill' + (current < 0 ? ' is-hidden' : '')} aria-hidden="true"><i /></span>
        {NAVS.map(([label, base, Icon]) => {
          const active = isActive(base, pathname);
          return (
            <Link key={base} href={href(base)} className={`mobile-nav-link ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>
              <Icon /><span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
