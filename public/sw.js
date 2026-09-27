const VERSION = 'archivum-offline-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const DATA_CACHE = `${VERSION}-data`;
const STATIC_ASSETS = ['/manifest.json', '/icon-192.png', '/icon-512.png', '/archivum-mark.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

const sameOrigin = (request) => new URL(request.url).origin === self.location.origin;
const cacheResponse = async (cacheName, request, response) => {
  if (response && response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !sameOrigin(request)) return;

  const url = new URL(request.url);
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) return;

  // Static assets: cache first, then network.
  if (url.pathname.startsWith('/_next/static/') || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => cacheResponse(STATIC_CACHE, request, response)))
    );
    return;
  }

  // Public resource data: stale-while-revalidate, so the last successful
  // class/subject search remains usable offline.
  if (url.pathname.startsWith('/api/resources') || url.pathname.startsWith('/api/subjects') || url.pathname.startsWith('/api/tips')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => cacheResponse(DATA_CACHE, request, response)).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Pages and RSC payloads: network first, then the last visited copy offline.
  // The bare root is cookie-dependent; only cache it when the class is explicit
  // in the URL so offline Class 9 never gets shown to a Class 10 user.
  const isBareRoot = url.pathname === '/' && !url.searchParams.has('class');
  event.respondWith(
    fetch(request).then((response) => isBareRoot ? response : cacheResponse(PAGE_CACHE, request, response)).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') return caches.match('/') || new Response('ARCHIVUM is offline.', { status: 503 });
      throw new Error('offline');
    })
  );
});
