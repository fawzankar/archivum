'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Check, GraduationCap, Sparkles } from 'lucide-react';
import { useStudentClass, type StudentClass } from './StudentClassContext';

const classes: StudentClass[] = [9, 10, 11, 12];

export default function FirstLaunch() {
  const { studentClass, setStudentClass } = useStudentClass();
  const router = useRouter();
  const pathname = usePathname();
  const [splash, setSplash] = useState(false);
  const [visible, setVisible] = useState(pathname !== '/');

  // Show the splash once per browser session. Navigating away and back to Home
  // in the same session does not replay it; a fresh session gets the 4s intro.
  useEffect(() => {
    if (pathname !== '/') {
      setSplash(false);
      setVisible(true);
      return;
    }

    const key = 'archivum_home_splash_seen_v1';
    if (window.sessionStorage.getItem(key) === '1') {
      setSplash(false);
      setVisible(true);
      return;
    }

    window.sessionStorage.setItem(key, '1');
    setSplash(true);
    setVisible(false);
    const timer = window.setTimeout(() => {
      setSplash(false);
      window.requestAnimationFrame(() => setVisible(true));
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (splash) {
    return (
      <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center" style={{ background: 'var(--hero-gradient)' }}>
        <div className="absolute inset-0 splash-grid" />
        <div className="relative text-center px-8">
          <div className="splash-orb absolute -inset-12 rounded-full" />
          <div className="relative mx-auto w-28 h-28 sm:w-36 sm:h-36 rounded-[2rem] flex items-center justify-center splash-logo" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', boxShadow: '0 30px 80px color-mix(in srgb, var(--accent) 38%, transparent)' }}>
            <span aria-hidden="true" className="archivum-mark w-14 h-14 sm:w-20 sm:h-20" style={{background:'var(--accent-contrast)'}} />
            <Sparkles className="absolute -right-2 -top-2 w-8 h-8" />
          </div>
          <div className="relative mt-8">
            <p className="brand-sister text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--accent-on-hero)' }}>SISTER ORGANISATION OF <span className="quest-word">QUEST</span></p>
            <h1 className="font-display text-4xl sm:text-5xl tracking-[.035em] mt-2" style={{ color: 'var(--hero-ink)' }}>ARCHIVUM</h1>
            <p className="mt-3 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--hero-muted)' }}>A place for SJS students for all the materials they need.</p>
            <p className="mt-6 text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: 'var(--hero-muted)' }}>Webapp developed by Fawzan Kar</p>
          </div>
        </div>
      </div>
    );
  }

  if (studentClass || !visible) return null;

  const chooseClass = (level: StudentClass) => {
    setStudentClass(level);
    // The homepage is server-rendered from the class query/cookie, so make the
    // selected class part of the URL immediately instead of waiting for a
    // later refresh or relying only on client storage.
    router.replace(`/?class=${level}`, { scroll: false });
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto flex items-center justify-center p-4 animate-soft-scale" style={{ background: 'color-mix(in srgb, var(--ivory) 90%, var(--accent-light))', backdropFilter: 'blur(14px)' }}>
      <div className="w-full max-w-xl rounded-[2rem] border p-6 sm:p-10 shadow-2xl" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
          <GraduationCap className="w-7 h-7" />
        </div>
        <div className="mt-6 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--accent)' }}>Personalise ARCHIVUM</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl" style={{ color: 'var(--ink)' }}>Which class are you in?</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>We’ll tune notes, papers, subjects and exam tips around your class. You can change this anytime from the menu.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-8">
          {classes.map((level) => (
            <button key={level} onClick={() => chooseClass(level)} className="group rounded-2xl border p-4 sm:p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[.98]" style={{ borderColor: 'var(--border)', background: 'var(--surface-raised)', color: 'var(--ink)' }}>
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-bold">{level}</span>
                <span className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}><Check className="w-4 h-4 opacity-0 group-hover:opacity-100" /></span>
              </div>
              <span className="block text-[11px] mt-4 font-semibold" style={{ color: 'var(--ink-muted)' }}>Class {level} archive</span>
            </button>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2 text-[10px] font-medium" style={{ color: 'var(--ink-faint)' }}><ArrowRight className="w-3.5 h-3.5" /> Your choice is stored only on this device.</div>
      </div>
    </div>
  );
}
