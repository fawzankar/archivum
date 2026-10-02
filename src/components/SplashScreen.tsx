'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const SPLASH_MS = 3200;
const LEAVE_MS = 450;

export default function SplashScreen() {
  const pathname = usePathname();
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (pathname !== '/') return;
    const root = document.documentElement;
    root.classList.add('splash-active');
    let minimumTimeElapsed = false;
    let startupReady = root.classList.contains('archivum-startup-ready');
    let leaveStarted = false;
    let leaveTimer: number | undefined;

    const beginLeave = () => {
      if (!minimumTimeElapsed || !startupReady || leaveStarted) return;
      leaveStarted = true;
      setLeaving(true);
      leaveTimer = window.setTimeout(() => {
        root.classList.remove('splash-active');
        setShow(false);
      }, LEAVE_MS);
    };
    const onStartupReady = () => {
      startupReady = true;
      beginLeave();
    };

    window.addEventListener('archivum:startup-ready', onStartupReady);
    const minimumTimer = window.setTimeout(() => {
      minimumTimeElapsed = true;
      beginLeave();
    }, SPLASH_MS - LEAVE_MS);
    if (startupReady) beginLeave();

    return () => {
      window.clearTimeout(minimumTimer);
      if (leaveTimer !== undefined) window.clearTimeout(leaveTimer);
      window.removeEventListener('archivum:startup-ready', onStartupReady);
      root.classList.remove('splash-active');
    };
  }, [pathname]);

  if (pathname !== '/' || !show) return null;
  return (
    <div className={'boot-splash sp' + (leaving ? ' is-leaving' : '')} aria-label="Loading ARCHIVUM" role="status">
      <div className="sp-backdrop" aria-hidden="true" />
      <span className="sp-orb sp-orb-a" aria-hidden="true" />
      <span className="sp-orb sp-orb-b" aria-hidden="true" />
      <div className="sp-content">
        <div className="sp-mark"><Image className="sp-logo" src="/archivum-logo-dark.png" alt="" width={72} height={72} priority /></div>
        <div className="sp-word" aria-hidden="true">ARCHIVUM</div>
        <p className="sp-kicker">A SISTER ORGANIZATION OF QUEST</p>
        <span className="sp-rule" aria-hidden="true"><span /></span>
      </div>
      <div className="sp-credit">This App Is Built By <strong>Fawzan Kar</strong></div>
    </div>
  );
}
