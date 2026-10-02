'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, FileText, Bookmark, Info } from 'lucide-react';
import { useStudentClass } from './StudentClassContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { studentClass } = useStudentClass();
  const [profileReady, setProfileReady] = useState(false);
  useEffect(() => { setProfileReady(true); }, []);
  const visibleStudentClass = profileReady ? studentClass : null;
  const href = (base: string) => visibleStudentClass ? `${base}?class=${visibleStudentClass}` : base;
  const navs = [['Home','/',Home],['Notes','/notes',BookOpen],['Papers','/previous-papers',FileText],['Saved','/saved',Bookmark],['About','/about',Info]] as const;
  return <nav className="mobile-nav" aria-label="Mobile navigation"><div className="mobile-nav-inner">{navs.map(([label,base,Icon]) => {
    const active = base === '/' ? pathname === '/' : pathname.startsWith(base);
    return <Link key={base} href={href(base)} className={`mobile-nav-link ${active ? 'active' : ''}`}><Icon /><span>{label}</span></Link>;
  })}</div></nav>;
}
