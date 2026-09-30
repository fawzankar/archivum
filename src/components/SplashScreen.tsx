'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import Art from './Art';

const SPLASH_MS = 4000; // splash length on every fresh open of the home page
const LEAVE_MS = 450; // fade-out at the end of the splash

/* Subject icons that orbit the logo. */
const SATELLITES = ['Maths', 'Biology', 'Chemistry', 'SST'];

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
      setProgress(Math.round((1 - Math.pow(1 - t, 1.6)) * 100));
    }, 30);
    const leave = window.setTimeout(() => setLeaving(true), SPLASH_MS - LEAVE_MS);
    const timer = window.setTimeout(() => { setShow(false); document.documentElement.classList.remove('archivum-booting'); }, SPLASH_MS);
    return () => { window.clearTimeout(timer); window.clearTimeout(leave); window.clearInterval(frame); };
  }, []);

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
