'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import Art from './Art';

const SPLASH_KEY = 'archivum_splash_seen_v2'; // shown once per device, never again
const SPLASH_MS = 1800;
const LEAVE_MS = 380; // fade-out at the end of the splash

/* Subject icons that orbit the logo. */
const SATELLITES = ['Maths', 'Biology', 'Chemistry', 'SST'];

export default function SplashScreen() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
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
    setLeaving(false);
    setProgress(0);
    const startedAt = performance.now();
    const frame = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      // ease-out so the bar feels quick at first and settles at 100%
      const t = Math.min(1, elapsed / (SPLASH_MS - LEAVE_MS));
      setProgress(Math.round((1 - Math.pow(1 - t, 2)) * 100));
    }, 30);
    const leave = window.setTimeout(() => setLeaving(true), SPLASH_MS - LEAVE_MS);
    const timer = window.setTimeout(() => { setShow(false); document.documentElement.classList.remove('archivum-booting'); }, SPLASH_MS);
    return () => { window.clearTimeout(timer); window.clearTimeout(leave); window.clearInterval(frame); };
  }, [pathname]);

  if (!show) return null;
  return (
    <div className={`boot-splash bs${leaving ? ' is-leaving' : ''}`} aria-label="Loading ARCHIVUM" role="status">
      <div className="bs-blob bs-blob-a" />
      <div className="bs-blob bs-blob-b" />
      <div className="bs-dots" />

      <div className="bs-stage">
        <div className="bs-ring" />
        <div className="bs-ring bs-ring-inner" />
        <div className="bs-ripple" />
        <div className="bs-ripple bs-ripple-2" />
        <div className="bs-orbit" aria-hidden="true">
          {SATELLITES.map((name, i) => (
            <div key={name} className="bs-sat" style={{ '--a': `${i * 90}deg`, '--d': `${0.5 + i * 0.12}s` } as CSSProperties}>
              <div className="bs-sat-in"><Art name={name} /></div>
            </div>
          ))}
        </div>
        <div className="bs-logo"><span className="archivum-css-logo" /></div>
      </div>

      <div className="bs-name" aria-hidden="true">
        {'ARCHIVUM'.split('').map((ch, i) => <span key={i} style={{ '--i': i } as CSSProperties}>{ch}</span>)}
      </div>
      <p className="bs-tag">Notes · Papers · Study material</p>

      <div className="bs-progress" aria-label={`Loading ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
      <div className="bs-percent">{progress}%</div>
      <p className="bs-credit">This App is Developed By Fawzan Kar</p>
    </div>
  );
}
