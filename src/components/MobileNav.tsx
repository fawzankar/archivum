'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Plus, FileText, Lightbulb } from 'lucide-react';
import { useStudentClass } from './StudentClassContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { studentClass } = useStudentClass();
  const href = (base: string) => studentClass ? `${base}?class=${studentClass}` : base;
  const navs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Notes', href: '/notes', icon: BookOpen },
    { label: 'Upload', href: '/upload', icon: Plus, isAction: true },
    { label: 'Papers', href: '/previous-papers', icon: FileText },
    { label: 'Tips', href: '/tips', icon: Lightbulb },
  ];
  return <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 mobile-nav-premium" style={{ minHeight: 68, paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
    <div className="flex items-center justify-around h-[68px] px-2 max-w-lg mx-auto">
      {navs.map(item => {
        const Icon = item.icon;
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        if (item.isAction) return <Link key={item.href} href={href(item.href)} className="flex items-center justify-center w-12 h-12" aria-label="Upload resource"><span className="w-11 h-11 flex items-center justify-center border" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-contrast)' }}><Icon className="w-5 h-5" /></span></Link>;
        return <Link key={item.href} href={href(item.href)} className="flex flex-col items-center justify-center gap-1 w-14 h-full text-[10px] font-medium" style={{ color: active ? 'var(--accent)' : 'var(--ink-muted)' }}><Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.2 : 1.8} /><span>{item.label}</span></Link>;
      })}
    </div>
  </nav>;
}
