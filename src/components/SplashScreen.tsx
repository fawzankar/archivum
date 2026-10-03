'use client';

import { useEffect, useState } from 'react';

// Styles, logo and the boot script live in src/lib/bootSplash.ts and are inlined in <head>, so the splash is the
// first thing painted on every full page load. The splash stays up for at least SPLASH_MS, then waits until the
// first real screen is mounted and fonts are ready, so it always fades out onto finished content, never a blank page.
const SPLASH_MS = 3000;
const LEAVE_MS = 450;
const READY_TIMEOUT_MS = 6000;

type BootWindow = Window & { __axBootTimedOut?: boolean };

const appReady = (root: HTMLElement) =>
  new Promise<void>(resolve => {
    if (root.dataset.axReady === '1') return resolve();
    const done = () => { window.removeEventListener('archivum:app-ready', done); resolve(); };
    window.addEventListener('archivum:app-ready', done);
    window.setTimeout(done, READY_TIMEOUT_MS);
  });

const fontsReady = () =>
  Promise.race([
    document.fonts ? document.fonts.ready.then(() => undefined) : Promise.resolve(),
    new Promise<void>(resolve => window.setTimeout(resolve, 1200)),
  ]);

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    let run = 0;
    let leaveTimer: number | undefined;

    const finish = () => {
      root.classList.remove('ax-leaving', 'ax-booting');
      setShow(false);
      window.dispatchEvent(new Event('archivum:splash-done'));
    };

    const start = () => {
      const id = ++run;
      window.clearTimeout(leaveTimer);
      root.classList.remove('ax-leaving');
      root.classList.add('ax-booting');
      setLeaving(false);
      setShow(true);

      const minimum = new Promise<void>(resolve => window.setTimeout(resolve, SPLASH_MS - LEAVE_MS));
      Promise.all([minimum, appReady(root), fontsReady()]).then(() => {
        if (id !== run) return;
        // Show the page underneath first, then fade the splash away over it.
        root.classList.remove('ax-booting');
        root.classList.add('ax-leaving');
        setLeaving(true);
        leaveTimer = window.setTimeout(finish, LEAVE_MS);
      });
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
      run++;
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
        <p className="ax-splash__kicker">A SISTER ORGANIZATION OF <span className="ax-splash__quest">QUEST</span></p>
        <span className="ax-splash__bar" aria-hidden="true"><i /></span>
      </div>
      <div className="ax-splash__credit">This App Is Built By <strong>Fawzan Kar</strong></div>
    </div>
  );
}
