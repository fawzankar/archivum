'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { warmLibrary } from '@/lib/libraryCache';

// Only the pages people actually open next. (Prefetching every route + 24 resource pages on
// Home fired dozens of requests/function calls and competed with the page the student was on.)
const KEY_ROUTES = ['/notes', '/previous-papers', '/search', '/saved', '/about', '/contact', '/contributors'];
const WARM_URLS = ['/notes', '/previous-papers', '/about', '/contact', '/contributors', '/saved', '/guidelines', '/privacy', '/terms', '/api/library'];

export default function PrefetchRoutes() {
  const router = useRouter();

  useEffect(() => {
    const run = () => {
      for (const route of KEY_ROUTES) router.prefetch(route);

      // 1) Put the whole library into localStorage (one request, only if missing/stale).
      warmLibrary();

      // 2) Ask the service worker to download the Notes/Papers pages + their JS/CSS for instant/offline use.
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((reg) => reg.active?.postMessage({ type: 'WARM', urls: WARM_URLS }))
          .catch(() => {});
      }
    };

    // Never compete with first paint / hydration: run when the browser is idle.
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(run, 1500);
    return () => window.clearTimeout(t);
  }, [router]);

  return null;
}
