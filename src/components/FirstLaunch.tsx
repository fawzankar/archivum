'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check, GraduationCap } from 'lucide-react';
import { useStudentClass, type StudentClass } from './StudentClassContext';
import { useTheme } from './ThemeContext';

const classes: StudentClass[] = [9, 10, 11, 12];

export default function FirstLaunch() {
  const { studentClass, setStudentClass } = useStudentClass();
  const { mode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [splash, setSplash] = useState(pathname === '/');
  const [visible, setVisible] = useState(pathname !== '/');

  useEffect(() => {
    if (pathname !== '/') {
      setSplash(false); setVisible(true); return;
    }
    const key = 'archivum_home_splash_seen_v2';
    if (window.sessionStorage.getItem(key) === '1') {
      setSplash(false); setVisible(true); return;
    }
    window.sessionStorage.setItem(key, '1');
    setSplash(true); setVisible(false);
    const timer = window.setTimeout(() => {
      setSplash(false);
      window.requestAnimationFrame(() => setVisible(true));
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (splash) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden" style={{background:'var(--hero-gradient)'}}>
        <div className="absolute inset-0 splash-grid" />
        <div className="relative text-center px-7">
          <div className="splash-logo mx-auto w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>
            <img src={mode === 'dark' ? '/archivum-logo-light.png' : '/archivum-logo-dark.png'} alt="ARCHIVUM" className="w-[72%] h-[72%] object-contain" />
          </div>
          <p className="mt-7 text-xs font-medium" style={{color:'var(--accent-on-hero)'}}>ARCHIVUM</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold" style={{color:'var(--hero-ink)'}}>Study material for SJS students.</h1>
          <p className="mt-3 max-w-md mx-auto text-sm" style={{color:'var(--hero-muted)'}}>
            Notes, previous papers and useful exam advice, arranged by class and subject.
          </p>
        </div>
      </div>
    );
  }

  if (studentClass || !visible) return null;

  const chooseClass = (level: StudentClass) => {
    setStudentClass(level);
    router.replace(`/?class=${level}`, {scroll:false});
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto flex items-center justify-center p-4" style={{background:'color-mix(in srgb,var(--ivory) 92%,var(--accent-light))'}}>
      <div className="w-full max-w-lg archive-surface p-6 sm:p-9">
        <div className="w-11 h-11 flex items-center justify-center" style={{background:'var(--accent-light)',color:'var(--accent)',borderRadius:'7px'}}>
          <GraduationCap className="w-5 h-5" />
        </div>
        <h2 className="mt-6 text-2xl sm:text-3xl font-semibold">Which class are you in?</h2>
        <p className="mt-3 text-sm leading-relaxed" style={{color:'var(--ink-muted)'}}>
          Choose once and the archive will keep your subjects and resources centred on your class. You can change it later from the menu.
        </p>
        <div className="grid grid-cols-2 gap-2.5 mt-7">
          {classes.map(level => (
            <button key={level} onClick={() => chooseClass(level)} className="border p-4 text-left" style={{borderColor:'var(--border)',background:'var(--surface-raised)',borderRadius:'8px'}}>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold">Class {level}</span>
                <Check className="w-4 h-4" style={{color:'var(--accent)'}} />
              </div>
              <span className="block text-xs mt-3" style={{color:'var(--ink-muted)'}}>Open your class archive</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
