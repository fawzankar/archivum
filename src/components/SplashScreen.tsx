'use client';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    let hideTimer: number | undefined;
    const done = () => {
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setShow(false), 220);
    };
    if (document.readyState === 'complete') done();
    else window.addEventListener('load', done, { once: true });
    const fallback = window.setTimeout(() => setShow(false), 1400);
    return () => {
      window.removeEventListener('load', done);
      window.clearTimeout(fallback);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, []);
  if (!show) return null;
  return <div className="boot-splash" aria-label="Loading ARCHIVUM" role="status"><div className="boot-splash-mark"><span className="archivum-css-logo" /></div><div className="boot-splash-name">ARCHIVUM</div><div className="boot-splash-line"><span /></div></div>;
}
