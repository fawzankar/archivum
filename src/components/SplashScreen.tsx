'use client';
import { useEffect, useState } from 'react';
import Art from './Art';

const SPLASH_MS = 4000; // splash length on every fresh open of the home page
const LEAVE_MS = 450; // fade-out at the end of the splash

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);

  // Runs ONCE per full page load (opening the site/app, or a browser refresh). SplashScreen lives in the
  // root layout, so in-app navigation (returning from Notes, Papers, menus...) never remounts it and the
  // splash does not appear again. It only plays when that page load is the home page.
  useEffect(() => {
    if (window.location.pathname !== '/') { document.documentElement.classList.remove('archivum-booting'); return; }
    document.documentElement.classList.add('archivum-booting');
    setShow(true);
    const startedAt = performance.now();
    const frame = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - startedAt) / (SPLASH_MS - LEAVE_MS));
      setProgress(Math.round(t * 100));
    }, 30);
    const leave = window.setTimeout(() => setLeaving(true), SPLASH_MS - LEAVE_MS);
    const timer = window.setTimeout(() => { setShow(false); document.documentElement.classList.remove('archivum-booting'); }, SPLASH_MS);
    return () => { window.clearTimeout(timer); window.clearTimeout(leave); window.clearInterval(frame); };
  }, []);

  if (!show) return null;
  return (
    <div className={`boot-splash bs${leaving ? ' is-leaving' : ''}`} aria-label="Loading ARCHIVUM" role="status">
      <div className="bs-logo"><Art name="SST" /></div>
      <div className="bs-name">ARCHIVUM</div>
      <div className="bs-progress" aria-label={`Loading ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
      <p className="bs-credit">This App is Developed By Fawzan Kar</p>
    </div>
  );
}
