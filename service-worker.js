// Service worker for the Allied Opportunities Index PWA.
// This version includes explicit cache versioning, skipWaiting, and
// cache cleanup on activate to ensure users receive the latest build.

const CACHE_NAME = 'aoi-v4-2025-09-27';
const CORE_ASSETS = [
  '/AOI/',
  '/AOI/index.html',
  '/AOI/world_map.svg',
  '/AOI/manifest.json',
  '/AOI/service-worker.js',
  '/AOI/icon-192x192.png',
  '/AOI/icon-512x512.png'
  , '/AOI/aoi_scores.js'
];

// During the installation phase, pre-cache the core assets and immediately
// take control of the page (skipWaiting) so that updates are applied without
// waiting for existing clients to close.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

// On activation, delete any old caches that don't match the current version
// and claim control over all clients so that pages are served by this SW.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Intercept fetch requests. Try the cache first; if not found, go to network.
// For fresh network responses, clone and cache them for future use.
self.addEventListener('fetch', event => {
  const { request } = event;
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});