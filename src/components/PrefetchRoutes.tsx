'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HTML_ROUTES = [
  '/', '/about', '/admin', '/admin/login', '/contact', '/contributors',
  '/feedback', '/guidelines', '/notes', '/previous-papers', '/privacy',
  '/saved', '/search', '/terms', '/tips', '/upload',
];

export default function PrefetchRoutes() {
  const router = useRouter();

  useEffect(() => {
    // Warm all known HTML routes after the first paint.
    const id = window.setTimeout(() => {
      for (const route of HTML_ROUTES) router.prefetch(route);
    }, 300);

    return () => window.clearTimeout(id);
  }, [router]);

  return null;
}
