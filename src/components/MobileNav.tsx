'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Plus, FileText, Lightbulb } from 'lucide-react';
import { useStudentClass } from './StudentClassContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { studentClass } = useStudentClass();
  const href = (base:string) => studentClass ? `${base}?class=${studentClass}` : base;
  const items = [
    {label:'Home', href:'/', icon:Home},
    {label:'Notes', href:'/notes', icon:BookOpen},
    {label:'Upload', href:'/upload', icon:Plus, action:true},
    {label:'Papers', href:'/previous-papers', icon:FileText},
    {label:'Tips', href:'/tips', icon:Lightbulb},
  ];
  return (
    <nav className="mobile-nav md:hidden fixed bottom-0 left-0 right-0 z-40" style={{paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
      <div className="max-w-lg mx-auto h-[64px] flex items-center justify-around">
        {items.map(item => {
          const Icon = item.icon;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          if (item.action) {
            return (
              <Link key={item.href} href={href(item.href)} className="flex flex-col items-center gap-1" aria-label="Upload a resource">
                <span className="mobile-nav__upload w-10 h-10 flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                <span className="text-[10px] font-medium" style={{color:'var(--ink)'}}>Upload</span>
              </Link>
            );
          }
          return (
            <Link key={item.href} href={href(item.href)} className="mobile-nav__item w-16 h-full flex flex-col items-center justify-center gap-1" data-active={active}>
              <Icon className="w-[18px] h-[18px]" strokeWidth={active?2.2:1.8} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
