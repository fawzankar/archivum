'use client';
import { useEffect, useState } from 'react';
import Credit from './Credit';

// How long the splash stays up, and how long the fade-out takes.
const SPLASH_MS = 2400;
const SPLASH_REDUCED_MS = 1200;
const FADE_MS = 450;

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    // Only on a cold load of the home page. Other routes skip it.
    if (window.location.pathname !== '/') {
      root.classList.remove('archivum-booting');
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = reduced ? SPLASH_REDUCED_MS : SPLASH_MS;

    root.classList.add('archivum-booting');
    setShow(true);
    const leave = window.setTimeout(() => setLeaving(true), total - FADE_MS);
    const done = window.setTimeout(() => {
      setShow(false);
      root.classList.remove('archivum-booting');
    }, total);
    return () => { window.clearTimeout(leave); window.clearTimeout(done); };
  }, []);

  if (!show) return null;

  return (
    <div className={`splash${leaving ? ' is-leaving' : ''}`} role="status" aria-label="Loading ARCHIVUM">
      <div className="splash-center" aria-hidden="true">
        <span className="splash-mark" />
        <span className="splash-word">ARCHIVUM</span>
      </div>
      <Credit className="splash-credit" />
    </div>
  );
}
