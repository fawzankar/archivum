'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const SPLASH_KEY = 'archivum_splash_seen_v2'; // shown once per device, never again
const SPLASH_MS = 900;

export default function SplashScreen() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (pathname !== '/') { document.documentElement.classList.remove('archivum-booting'); return; }
    try {
      if (localStorage.getItem(SPLASH_KEY) === '1') { document.documentElement.classList.remove('archivum-booting'); return; }
      localStorage.setItem(SPLASH_KEY, '1');
    } catch {
      // If storage is unavailable, still give a normal first-load splash.
    }
    setShow(true);
    setProgress(0);
    const startedAt = performance.now();
    const duration = SPLASH_MS;
    const frame = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      setProgress(Math.min(100, Math.round((elapsed / duration) * 100)));
    }, 30);
    const timer = window.setTimeout(() => { setShow(false); document.documentElement.classList.remove('archivum-booting'); }, SPLASH_MS);
    return () => { window.clearTimeout(timer); window.clearInterval(frame); };
  }, [pathname]);

  if (!show) return null;
  return (
    <div className="boot-splash" aria-label="Loading ARCHIVUM" role="status">
      <div className="boot-splash-mark"><span className="archivum-css-logo" /></div>
      <div className="boot-splash-name">ARCHIVUM</div>
      <p className="boot-splash-credit">This App is Developed By Fawzan Kar</p>
      <div className="boot-splash-progress" aria-label={`Loading ${progress}%`}><span style={{ width: `${progress}%` }} /></div><div className="boot-splash-percent">{progress}%</div>
    </div>
  );
}
