'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useStudentClass, type StudentClass } from './StudentClassContext';
import { useTheme } from './ThemeContext';

const classes: StudentClass[] = [9,10,11,12];

export default function FirstLaunch() {
  const { studentClass, setStudentClass } = useStudentClass();
  const { mode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [splash, setSplash] = useState(pathname === '/');
  const [visible, setVisible] = useState(pathname !== '/');

  useEffect(() => {
    if (pathname !== '/') { setSplash(false); setVisible(true); return; }
    const key = 'archivum_home_splash_seen_v2';
    if (window.sessionStorage.getItem(key) === '1') { setSplash(false); setVisible(true); return; }
    window.sessionStorage.setItem(key,'1');
    setSplash(true); setVisible(false);
    const timer = window.setTimeout(() => { setSplash(false); window.requestAnimationFrame(() => setVisible(true)); }, 2600);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (splash) return <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden" style={{background:'var(--ivory)'}}>
    <div className="absolute inset-0 splash-grid" />
    <div className="relative text-center px-8">
      <div className="splash-logo mx-auto w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center"><img src={mode === 'dark' ? '/archivum-logo-dark.png' : '/archivum-logo-light.png'} alt="ARCHIVUM logo" className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-[0_14px_24px_rgba(15,35,45,0.18)] dark:drop-shadow-[0_14px_28px_rgba(0,0,0,0.35)]" /></div>
      <h1 className="font-display text-4xl sm:text-5xl mt-7">ARCHIVUM</h1>
      <p className="max-w-sm mx-auto mt-3 text-sm leading-6" style={{color:'var(--ink-muted)'}}>A student archive for SJS notes, papers and the material you wish you had kept from last year.</p>
    </div>
  </div>;

  if (studentClass || !visible) return null;
  const chooseClass = (level: StudentClass) => { setStudentClass(level); router.replace(`/?class=${level}`, {scroll:false}); router.refresh(); };

  return <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto p-4" style={{background:'color-mix(in srgb,var(--ivory) 94%,var(--accent-light))'}}>
    <div className="w-full max-w-2xl border p-7 sm:p-10" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
      <p className="text-sm font-medium" style={{color:'var(--accent)'}}>Set your class</p>
      <h2 className="font-display text-4xl sm:text-5xl mt-3">Which class are you studying in?</h2>
      <p className="mt-4 text-sm leading-6 max-w-2xl" style={{color:'var(--ink-muted)'}}>ARCHIVUM will use this choice to put the right subjects and resources in front of you. You can change it later from the menu.</p>
      <div className="grid grid-cols-2 gap-3 mt-8">
        {classes.map(level => <button key={level} onClick={() => chooseClass(level)} className="text-left border p-5 transition-colors" style={{borderColor:'var(--border)',background:'var(--surface)',color:'var(--ink)'}}>
          <div className="flex items-center justify-between"><span className="font-display text-3xl">{level}</span><Check className="w-5 h-5 opacity-0 group-hover:opacity-100" style={{color:'var(--accent)'}}/></div>
          <span className="block mt-4 text-sm font-medium">Class {level}</span>
        </button>)}
      </div>
    </div>
  </div>;
}
