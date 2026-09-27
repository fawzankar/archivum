const VERSION = 'archivum-offline-v4';
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

  if (url.pathname.startsWith('/_next/static/') || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => cacheResponse(STATIC_CACHE, request, response)))
    );
    return;
  }

  // Cache a successfully opened PDF/file so a previously viewed resource can
  // still be opened offline. The signed R2 response is stored against the
  // same-origin file route that the app uses.
  if (/^\/api\/resources\/[^/]+\/file$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => cacheResponse(DATA_CACHE, request, response)))
    );
    return;
  }

  if (url.pathname.startsWith('/api/resources') || url.pathname.startsWith('/api/subjects') || url.pathname.startsWith('/api/tips')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => cacheResponse(DATA_CACHE, request, response)).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).then((response) => {
      // Cache every successfully visited document/RSC request. This makes the
      // actual pages a usable offline shell instead of relying on a bare `/`
      // fallback that may belong to another class.
      if (request.mode === 'navigate' || request.headers.get('RSC') === '1') {
        return cacheResponse(PAGE_CACHE, request, response);
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        return caches.match('/?source=pwa') || caches.match('/') || new Response(
          '<!doctype html><title>ARCHIVUM Offline</title><body style="font-family:system-ui;padding:2rem">ARCHIVUM is offline. Open a page once while online to make it available offline.</body>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
      throw new Error('offline');
    })
  );
});
