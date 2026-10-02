'use client';

import Image from 'next/image';
import { useLayoutEffect, useState } from 'react';

const SPLASH_MS = 3200;
const LEAVE_MS = 450;

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (window.location.pathname !== '/') {
      root.classList.remove('splash-active');
      setShow(false);
      return;
    }
    let minimumTimeElapsed = false;
    let startupReady = root.classList.contains('archivum-startup-ready');
    let leaveStarted = false;
    let minimumTimer: number | undefined;
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

    const activate = () => {
      window.clearTimeout(minimumTimer);
      if (leaveTimer !== undefined) window.clearTimeout(leaveTimer);
      minimumTimeElapsed = false;
      startupReady = root.classList.contains('archivum-startup-ready');
      leaveStarted = false;
      setLeaving(false);
      setShow(true);
      root.classList.add('splash-active');
      minimumTimer = window.setTimeout(() => {
        minimumTimeElapsed = true;
        beginLeave();
      }, SPLASH_MS - LEAVE_MS);
      if (startupReady) beginLeave();
    };

    window.addEventListener('archivum:startup-ready', onStartupReady);
    window.addEventListener('archivum:show-splash', activate);
    activate();

    return () => {
      window.clearTimeout(minimumTimer);
      if (leaveTimer !== undefined) window.clearTimeout(leaveTimer);
      window.removeEventListener('archivum:startup-ready', onStartupReady);
      window.removeEventListener('archivum:show-splash', activate);
      root.classList.remove('splash-active');
    };
  }, []);

  if (!show) return null;
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
