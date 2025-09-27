// A simple service worker for caching the Allied Opportunities web app.
const cacheName = 'aoi-cache-v1';
const filesToCache = [
  '/',
  '/aoi_interactive.html',
  '/world_map.svg',
  '/manifest.json',
  '/service-worker.js',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});