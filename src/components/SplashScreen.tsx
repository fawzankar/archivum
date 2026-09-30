'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const SPLASH_MS = 2900;
const LEAVE_MS = 550;
const LETTERS = 'ARCHIVUM'.split('');

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (window.location.pathname !== '/') {
      document.documentElement.classList.remove('archivum-booting');
      return;
    }
    document.documentElement.classList.add('archivum-booting');
    setShow(true);
    const leave = window.setTimeout(() => setLeaving(true), SPLASH_MS - LEAVE_MS);
    const done = window.setTimeout(() => {
      setShow(false);
      document.documentElement.classList.remove('archivum-booting');
    }, SPLASH_MS);
    return () => { window.clearTimeout(leave); window.clearTimeout(done); };
  }, []);

  if (!show) return null;

  return (
    <div className={`boot-splash sp${leaving ? ' is-leaving' : ''}`} aria-label="Loading ARCHIVUM" role="status">
      <span className="sp-orb sp-orb-a" /><span className="sp-orb sp-orb-b" />
      <span className="sp-frame" aria-hidden="true" />
      <div className="sp-content">
        <div className="sp-mark">
          <Image className="sp-logo" src="/archivum-logo-dark.png" alt="" width={72} height={72} priority />
        </div>
        <div className="sp-word" aria-hidden="true">
          {LETTERS.map((l, i) => <span key={i} style={{ ['--i' as string]: i }}>{l}</span>)}
        </div>
        <div className="sp-rule" aria-hidden="true"><i /></div>
        <p className="sp-tag">Notes <b>·</b> Papers <b>·</b> Study Material</p>
      </div>
      <div className="sp-credit">Made by Fawzan Kar</div>
    </div>
  );
}
