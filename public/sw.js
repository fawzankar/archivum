const VERSION = 'archivum-offline-v14';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const DATA_CACHE = `${VERSION}-data`;
const STATIC_ASSETS = ['/manifest.json', '/icon-192.png', '/icon-512.png', '/archivum-icon-192.png', '/archivum-icon-512.png'];
// Statically generated pages: identical HTML for every query string, so cache them by pathname.
const LIBRARY_PAGES = ['/notes', '/previous-papers', '/tips'];
const LIBRARY_DATA = '/api/library';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => warm(LIBRARY_PAGES.concat(LIBRARY_DATA))).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'WARM' && Array.isArray(data.urls)) event.waitUntil(warm(data.urls));
});

const sameOrigin = (request) => new URL(request.url).origin === self.location.origin;
const pageKey = (url) => new Request(url.origin + url.pathname);

const cacheResponse = async (cacheName, request, response) => {
  if (response && response.ok && response.status !== 206) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
};

// Download a page/data URL and, for HTML, also its JS + CSS so the page opens fully offline.
async function warm(urls) {
  await Promise.all(urls.map(async (path) => {
    try {
      const url = new URL(path, self.location.origin);
      if (url.origin !== self.location.origin) return;
      const response = await fetch(url.pathname, { credentials: 'same-origin' });
      if (!response.ok) return;
      if (url.pathname === LIBRARY_DATA) {
        await cacheResponse(DATA_CACHE, new Request(url.origin + url.pathname), response);
        return;
      }
      const html = await response.clone().text();
      await cacheResponse(PAGE_CACHE, pageKey(url), response);
      const assets = new Set();
      for (const m of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"?]+\.(?:js|css))"/g)) assets.add(m[1]);
      const staticCache = await caches.open(STATIC_CACHE);
      await Promise.all([...assets].map(async (asset) => {
        if (await staticCache.match(asset)) return;
        try { const r = await fetch(asset); if (r.ok) await staticCache.put(asset, r); } catch (e) { /* offline */ }
      }));
    } catch (e) { /* ignore */ }
  }));
}

// Stale-while-revalidate: answer instantly from cache, refresh the cache in the background.
async function staleWhileRevalidate(event, cacheName, key) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(key);
  const network = fetch(event.request.mode === 'navigate' ? key.url : event.request)
    .then((response) => { if (response && response.ok) cache.put(key, response.clone()); return response; })
    .catch(() => null);
  if (cached) { event.waitUntil(network); return cached; }
  const fresh = await network;
  return fresh || new Response('', { status: 504 });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !sameOrigin(request)) return;

  const url = new URL(request.url);
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) return;
  if (url.pathname.startsWith('/api/resources/') && url.pathname.endsWith('/file')) return;

  // Immutable build assets + app icons: cache first.
  if (url.pathname.startsWith('/_next/static/') || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => cacheResponse(STATIC_CACHE, request, response))));
    return;
  }

  // The whole Notes + Papers library: instant from cache, refreshed in the background.
  if (url.pathname === LIBRARY_DATA) {
    event.respondWith(staleWhileRevalidate(event, DATA_CACHE, new Request(url.origin + url.pathname)));
    return;
  }

  // Notes / Papers pages (full page loads): instant from cache, refreshed in the background.
  if (request.mode === 'navigate' && LIBRARY_PAGES.includes(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event, PAGE_CACHE, pageKey(url)));
    return;
  }

  if (url.pathname.startsWith('/api/resources') || url.pathname.startsWith('/api/subjects') || url.pathname.startsWith('/api/tips')) {
    event.respondWith(
      fetch(request).then((response) => cacheResponse(DATA_CACHE, request, response)).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    fetch(request).then((response) => {
      if (request.mode === 'navigate' || request.headers.get('RSC') === '1') return cacheResponse(PAGE_CACHE, request, response);
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        return (await caches.match('/')) || new Response(
          '<!doctype html><title>ARCHIVUM Offline</title><body style="font-family:system-ui;padding:2rem">ARCHIVUM is offline.</body>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
      throw new Error('offline');
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    const decoded = event.data ? event.data.json() : {};
    payload = decoded && typeof decoded === 'object' ? decoded : { body: String(decoded || '') };
  } catch { payload = { body: event.data?.text() || '' }; }
  const title = typeof payload.title === 'string' ? payload.title.slice(0, 80) : 'A gentle study reminder';
  const body = typeof payload.body === 'string' ? payload.body.slice(0, 280) : 'Take a few minutes to revise something today.';
  const url = typeof payload.url === 'string' && payload.url.startsWith('/') ? payload.url : '/';
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url },
    tag: payload.tag || 'archivum-study-reminder',
    renotify: Boolean(payload.renotify),
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const path = typeof event.notification.data?.url === 'string' && event.notification.data.url.startsWith('/') ? event.notification.data.url : '/';
  const target = new URL(path, self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windows) => {
    const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
    if (existing) { await existing.navigate(target); return existing.focus(); }
    return clients.openWindow(target);
  }));
});
