'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Plus, FileText, Bookmark } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const navs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Notes', href: '/notes', icon: BookOpen },
    { label: 'Upload', href: '/upload', icon: Plus, isAction: true },
    { label: 'Papers', href: '/previous-papers', icon: FileText },
    { label: 'Saved', href: '/saved', icon: Bookmark },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t shadow-[0_-8px_24px_rgba(15,23,42,0.06)]" style={{ minHeight: '66px', backgroundColor: 'color-mix(in srgb, var(--surface) 94%, transparent)', backdropFilter: 'blur(18px)', borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-[66px] px-1 max-w-lg mx-auto">
        {navs.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          if (item.isAction) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center -mt-5 active:scale-95" aria-label="Upload resource">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}>
                  <Plus className="w-6 h-6 stroke-[2.4]" />
                </div>
                <span className="text-[9px] font-bold mt-1" style={{ color: 'var(--ink)' }}>Upload</span>
              </Link>
            );
          }
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 w-14 h-full active:scale-95" style={{ color: active ? 'var(--accent)' : 'var(--ink-muted)' }} aria-label={item.label}>
              <Icon className={`w-[19px] h-[19px] ${active ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              <span className="text-[9px] leading-none font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
