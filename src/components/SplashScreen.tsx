'use client';

import { useEffect, useState } from 'react';

// Styles, logo and the boot script that switches this on live in src/lib/bootSplash.ts and are inlined in <head>,
// so the splash is the first thing painted on every full page load, whatever URL was opened.
const SPLASH_MS = 3200;
const LEAVE_MS = 450;

type BootWindow = Window & { __axBootTimedOut?: boolean };

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    let holdTimer: number | undefined;
    let leaveTimer: number | undefined;

    const finish = () => {
      root.classList.remove('ax-booting');
      setShow(false);
      window.dispatchEvent(new Event('archivum:splash-done'));
    };

    const start = () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(leaveTimer);
      root.classList.add('ax-booting');
      setLeaving(false);
      setShow(true);
      holdTimer = window.setTimeout(() => {
        setLeaving(true);
        leaveTimer = window.setTimeout(finish, LEAVE_MS);
      }, SPLASH_MS - LEAVE_MS);
    };

    // The boot script already gave up on a very slow start; don't pop the splash up late.
    if ((window as BootWindow).__axBootTimedOut) {
      setShow(false);
      window.dispatchEvent(new Event('archivum:splash-done'));
    } else {
      start();
    }

    window.addEventListener('archivum:show-splash', start);
    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(leaveTimer);
      window.removeEventListener('archivum:show-splash', start);
    };
  }, []);

  if (!show) return null;
  return (
    <div className={'ax-splash' + (leaving ? ' is-leaving' : '')} role="status" aria-label="Loading ARCHIVUM">
      <div className="ax-splash__body">
        <div className="ax-splash__mark" aria-hidden="true" />
        <div className="ax-splash__word" aria-hidden="true">ARCHIVUM</div>
        <p className="ax-splash__kicker">A SISTER ORGANIZATION OF QUEST</p>
        <span className="ax-splash__bar" aria-hidden="true"><i /></span>
      </div>
      <div className="ax-splash__credit">This App Is Built By <strong>Fawzan Kar</strong></div>
    </div>
  );
}
