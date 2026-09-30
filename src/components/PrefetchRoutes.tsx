'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ROUTES = [
  '/notes',
  '/previous-papers',
  '/search',
  '/saved',
  '/about',
  '/contact',
  '/contributors',
];

export default function PrefetchRoutes() {
  const router = useRouter();

  useEffect(() => {
    const run = () => {
      for (const route of ROUTES) router.prefetch(route);
    };

    const idle = 'requestIdleCallback' in window
      ? window.requestIdleCallback(run, { timeout: 1200 })
      : window.setTimeout(run, 350);

    return () => {
      if (typeof idle === 'number') window.clearTimeout(idle);
      else window.cancelIdleCallback?.(idle);
    };
  }, [router]);

  return null;
}
