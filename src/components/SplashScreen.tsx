'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const SPLASH_KEY = 'archivum_home_splash_seen';

export default function SplashScreen() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname !== '/') return;
    try {
      if (sessionStorage.getItem(SPLASH_KEY) === '1') return;
      sessionStorage.setItem(SPLASH_KEY, '1');
    } catch {
      // If storage is unavailable, still give a normal first-load splash.
    }
    setShow(true);
    const timer = window.setTimeout(() => setShow(false), 3000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!show) return null;
  return (
    <div className="boot-splash" aria-label="Loading ARCHIVUM" role="status">
      <div className="boot-splash-mark"><span className="archivum-css-logo" /></div>
      <div className="boot-splash-name">ARCHIVUM</div>
      <p className="boot-splash-credit">This App is Developed by Fawzan Kar</p>
      <div className="boot-splash-line"><span /></div>
    </div>
  );
}
