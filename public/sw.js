// ARCHIVUM needs the internet to load notes and papers, so this worker does only two things:
// 1) keeps the app shell assets fast (cache-first for immutable build files and icons), and
// 2) when a page can't be reached because there is no connection, shows a clear "You're offline" screen.
const VERSION = 'archivum-offline-v17';
const STATIC_CACHE = `${VERSION}-static`;
const STATIC_ASSETS = ['/manifest.json', '/offline.html', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png', '/sounds/pop.mp3'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    // Drop every old page/data cache from earlier versions. Keep PDFs the user saved on purpose.
    keys.filter((key) => key.startsWith('archivum-offline-') && !key.startsWith(VERSION) && !key.startsWith('archivum-offline-pdfs-')).map((key) => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/')) return;

  // Immutable build files + icons: cache first, so the shell and the offline screen always load instantly.
  if (url.pathname.startsWith('/_next/static/') || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response && response.ok && response.status !== 206) { const copy = response.clone(); caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)); }
      return response;
    })));
    return;
  }

  // Opening or reloading a page with no internet: say so, instead of showing a half-working old copy.
  if (request.mode === 'navigate') {
    // `no-cache` makes the browser re-check with the server, so a stale HTTP-cached copy is never shown offline.
    event.respondWith(fetch(request, { cache: 'no-cache' }).catch(async () => (await caches.match('/offline.html')) || new Response('You are offline.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })));
  }
});
