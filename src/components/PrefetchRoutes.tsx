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
        const stored = Number(localStorage.getItem('archivum_student_class') || '');
        const activeClass = [9, 10, 11, 12].includes(stored) ? stored : 10;

        // Load only the class the student is actually going to see first.
        // Other classes are deliberately deferred so Home does not hammer Turso.
        const response = await fetch(`/api/library-prefetch?class=${activeClass}`, { cache: 'force-cache' });
        const data = await response.json();

        try {
          const previous = sessionStorage.getItem('archivum_library_prefetch_v2');
          const old = previous ? JSON.parse(previous) : { notes: {}, papers: {}, version: 2 };
          old.notes = { ...(old.notes || {}), ...(data.notes || {}) };
          old.papers = { ...(old.papers || {}), ...(data.papers || {}) };
          sessionStorage.setItem('archivum_library_prefetch_v2', JSON.stringify(old));
          // Keep v1 available for older sessions, but don't make it the primary path.
          sessionStorage.setItem('archivum_library_prefetch_v1', JSON.stringify(old));
        } catch {}

        // Prefetch the HTML structure/routes immediately, without fetching all library data.
        for (const route of HTML_ROUTES) router.prefetch(route);

        // Warm individual resource HTML in small background batches.
        const resourceResponse = await fetch('/api/prefetch', { cache: 'force-cache' });
        const resourceData = await resourceResponse.json();
        const resources: string[] = Array.isArray(resourceData?.resources) ? resourceData.resources : [];
        for (let i = 0; i < Math.min(resources.length, 24) && !cancelled; i += 8) {
          for (const route of resources.slice(i, i + 8)) router.prefetch(route);
          await new Promise<void>((resolve) => window.setTimeout(resolve, 80));
        }

        // Defer other class data until the browser is idle / the initial UI is settled.
        const remaining = [9, 10, 11, 12].filter((c) => c !== activeClass);
        const warmNextClass = async (index: number) => {
          if (cancelled || index >= remaining.length) return;
          const cls = remaining[index];
          try {
            const r = await fetch(`/api/library-prefetch?class=${cls}`, { cache: 'force-cache' });
            const d = await r.json();
            const previous = sessionStorage.getItem('archivum_library_prefetch_v2');
            const cache = previous ? JSON.parse(previous) : { notes: {}, papers: {}, version: 2 };
            cache.notes = { ...(cache.notes || {}), ...(d.notes || {}) };
            cache.papers = { ...(cache.papers || {}), ...(d.papers || {}) };
            sessionStorage.setItem('archivum_library_prefetch_v2', JSON.stringify(cache));
          } catch {}
          window.setTimeout(() => void warmNextClass(index + 1), 700);
        };

        window.setTimeout(() => void warmNextClass(0), 1400);
      } catch {
        // Navigation still works normally if warm-up is unavailable.
      }
    };

    void warmResources();
    return () => { cancelled = true; };
  }, [router]);

  return null;
}
