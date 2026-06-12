const CACHE_NAME = 'wireverse-v1';
const urlsToCache = [
  '/SpaceFleetInfinity/',
  '/SpaceFleetInfinity/index.html',
  '/SpaceFleetInfinity/manifest.webmanifest',
  '/SpaceFleetInfinity/favicon.svg',
];

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Cache opened');
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn('Service Worker: Some resources failed to cache', err);
      });
    })
  );
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone();

        // Cache the response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Optional: Return a custom offline page
          return new Response('Offline - Datei nicht verfügbar', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});
