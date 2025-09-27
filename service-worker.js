// Service Worker for the AOI PWA (version 5)
// This file caches core assets and updates itself when a new version is deployed.

const CACHE_NAME = 'aoi-v5-2025-09-27';
const CORE_ASSETS = [
  '/AOI/',
  '/AOI/index.html',
  '/AOI/world_map.svg',
  '/AOI/manifest.json',
  '/AOI/aoi_scores.js',
  '/AOI/service-worker.js',
  '/AOI/icon-192x192.png',
  '/AOI/icon-512x512.png'
];

// Install event: pre-cache core assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

// Activate event: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event: serve from cache, then network fallback and cache the new response
self.addEventListener('fetch', event => {
  const request = event.request;
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request)
        .then(response => {
          // Clone response and cache it
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => cachedResponse);
    })
  );
});