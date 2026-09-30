'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const SPLASH_MS = 2400;
const LEAVE_MS = 420;

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.location.pathname !== '/') {
      document.documentElement.classList.remove('archivum-booting');
      return;
    }

    document.documentElement.classList.add('archivum-booting');
    setShow(true);
    const startedAt = performance.now();
    const frame = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - startedAt) / (SPLASH_MS - LEAVE_MS));
      setProgress(Math.round(t * 100));
    }, 40);

    const leave = window.setTimeout(() => setLeaving(true), SPLASH_MS - LEAVE_MS);
    const timer = window.setTimeout(() => {
      setShow(false);
      document.documentElement.classList.remove('archivum-booting');
    }, SPLASH_MS);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(leave);
      window.clearInterval(frame);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`boot-splash bs${leaving ? ' is-leaving' : ''}`} aria-label="Loading ARCHIVUM" role="status">
      <div className="bs-orbit bs-orbit-one" aria-hidden="true" />
      <div className="bs-orbit bs-orbit-two" aria-hidden="true" />
      <div className="bs-glow bs-glow-one" aria-hidden="true" />
      <div className="bs-glow bs-glow-two" aria-hidden="true" />

      <div className="bs-content">
        <div className="bs-logo-wrap">
          <div className="bs-logo-ring" aria-hidden="true" />
          <Image
            className="bs-logo-image"
            src="/archivum-logo-light.png"
            alt="ARCHIVUM logo"
            width={150}
            height={150}
            priority
          />
        </div>

        <div className="bs-name" aria-label="ARCHIVUM">
          <span>A</span><span>R</span><span>C</span><span>H</span><span>I</span><span>V</span><span>U</span><span>M</span>
        </div>

        <div className="bs-divider" aria-hidden="true" />
        <p className="bs-tagline">A Sister Organization Of <span className="quest-word">QUEST</span></p>

        <div className="bs-progress" aria-label={`Loading ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bs-credit">
        <span className="bs-credit-label">CRAFTED WITH CARE</span>
        <span className="bs-credit-name">by Fawzan Kar</span>
      </div>
    </div>
  );
}
