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
        // Warm the actual class-filtered library data, not just the HTML route.
        // This is what makes Notes/Papers open immediately after Home has loaded.
        const libraryResponse = await fetch('/api/library-prefetch', { cache: 'force-cache' });
        const libraryData = await libraryResponse.json();
        try {
          sessionStorage.setItem('archivum_library_prefetch_v1', JSON.stringify(libraryData));
        } catch {}

        const response = await fetch('/api/prefetch', { cache: 'force-cache' });
        const data = await response.json();
        const resources: string[] = Array.isArray(data?.resources) ? data.resources : [];

        const batchSize = 12;
        for (let i = 0; i < resources.length && !cancelled; i += batchSize) {
          for (const route of resources.slice(i, i + batchSize)) router.prefetch(route);
          await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
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
