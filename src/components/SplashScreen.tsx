'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
const SPLASH_MS = 3200;
const LEAVE_MS = 450;
export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (window.location.pathname !== '/') { document.documentElement.classList.remove('archivum-booting'); return; }
    document.documentElement.classList.add('archivum-booting');
    setShow(true);
    const leave = window.setTimeout(() => setLeaving(true), SPLASH_MS - LEAVE_MS);
    const done = window.setTimeout(() => { setShow(false); document.documentElement.classList.remove('archivum-booting'); }, SPLASH_MS);
    return () => { window.clearTimeout(leave); window.clearTimeout(done); };
  }, []);
  if (!show) return null;
  return (
    <div className={`boot-splash sp${leaving ? ' is-leaving' : ''}`} aria-label="Loading ARCHIVUM" role="status">
      <div className="sp-backdrop" aria-hidden="true" />
      <span className="sp-orb sp-orb-a" aria-hidden="true" /><span className="sp-orb sp-orb-b" aria-hidden="true" />
      <div className="sp-content">
        <div className="sp-mark"><Image className="sp-logo" src="/archivum-logo-dark.png" alt="" width={72} height={72} priority /></div>
        <div className="sp-word" aria-hidden="true">ARCHIVUM</div>
        <p className="sp-kicker">A Sister Organization of Quest</p>
        <span className="sp-rule" aria-hidden="true"><span /></span>
      </div>
      <div className="sp-credit">This App Is Built By <strong>Fawzan Kar</strong></div>
    </div>
  );
}
