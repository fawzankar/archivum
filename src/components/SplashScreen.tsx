'use client';
import React from 'react';
import { useEffect, useState } from 'react';

const SPLASH_MS = 1750;
const LEAVE_MS = 280;

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.location.pathname !== '/') {
      document.documentElement.classList.remove('archivum-booting');
      return;
    }
    document.documentElement.classList.add('archivum-booting');
    const started = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - started;
      const eased = Math.min(100, Math.round((1 - Math.pow(1 - Math.min(elapsed / SPLASH_MS, 1), 2.2)) * 100));
      setProgress(eased);
      if (elapsed < SPLASH_MS) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    const leave = window.setTimeout(() => setLeaving(true), SPLASH_MS - LEAVE_MS);
    const timer = window.setTimeout(() => {
      setShow(false);
      document.documentElement.classList.remove('archivum-booting');
    }, SPLASH_MS);
    setShow(true);
    return () => { window.clearTimeout(timer); window.clearTimeout(leave); window.cancelAnimationFrame(raf); };
  }, []);

  if (!show) return null;

  return (
    <div className={`boot-splash bs${leaving ? ' is-leaving' : ''}`} aria-label="Loading ARCHIVUM" role="status">
      <div className="bs-content">
        <div className="bs-overline">THE ACADEMIC ARCHIVE</div>
        <div className="bs-mark-frame" aria-hidden="true">
          <span className="bs-monogram">A</span>
        </div>
        <div className="bs-name" aria-label="ARCHIVUM">
          {'ARCHIVUM'.split('').map((letter, index) => (
            <span key={`${letter}-${index}`} style={{ '--bs-delay': `${index * 55}ms` } as React.CSSProperties}>{letter}</span>
          ))}
        </div>
        <p className="bs-tagline">NOTES · PAPERS · STUDY MATERIAL</p>
        <div className="bs-rule" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="bs-credit">This App Is Made By Fawzan Kar</div>
    </div>
  );
}
