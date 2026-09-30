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

    const idle = window.setTimeout(run, 350);
    return () => window.clearTimeout(idle);
  }, [router]);

  return null;
}
