'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HTML_ROUTES = [
  '/', '/about', '/contact', '/contributors', '/feedback', '/guidelines',
  '/notes', '/previous-papers', '/privacy', '/saved', '/search', '/terms',
  '/tips', '/upload',
];

export default function PrefetchRoutes() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    // Do not wait several hundred milliseconds: the home page is the warm-up page.
    for (const route of HTML_ROUTES) {
      router.prefetch(route);
    }

    const warmResources = async () => {
      try {
        const response = await fetch('/api/prefetch', { cache: 'force-cache' });
        const data = await response.json();
        const resources: string[] = Array.isArray(data?.resources) ? data.resources : [];

        // Prefetch in batches so mobile stays responsive while the route cache warms.
        const batchSize = 8;
        for (let i = 0; i < resources.length && !cancelled; i += batchSize) {
          const batch = resources.slice(i, i + batchSize);
          for (const route of batch) router.prefetch(route);
          await new Promise<void>((resolve) => {
            if ('requestIdleCallback' in window) {
              (window as Window & { requestIdleCallback?: (cb: () => void) => number })
                .requestIdleCallback?.(() => resolve());
            } else {
              window.setTimeout(resolve, 0);
            }
          });
        }
      } catch {
        // Navigation still works normally if the warm-up endpoint is unavailable.
      }
    };

    void warmResources();
    return () => { cancelled = true; };
  }, [router]);

  return null;
}
