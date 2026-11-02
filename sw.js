// Square Dash service worker: caches the game so it works with no signal.
// Bump CACHE to force an update after you change index.html.
const CACHE = 'square-dash-v1';
const FILES = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve from cache first (instant, offline-safe), refresh the cache in the background.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request)
      .then(r => { if (r.ok) c.put(e.request, r.clone()); return r; })
      .catch(() => null);
    return hit || (await net) || c.match('./index.html');
  }));
});
