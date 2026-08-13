const CACHE_NAME = 'counselspace-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './css/style.css?v=5.0',
  './js/app.js?v=4.6',
  './images/spacebot.png',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/selfcek_cropped.png',
  './images/page2-scene.png?v=1.2'
];

// Self install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Self activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (e) => {
  // Skip POST/PUT/DELETE and API routes
  if (e.request.method !== 'GET' || e.request.url.includes('/api/')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response && response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and request is page navigation, fallback to root
          if (e.request.mode === 'navigate') {
            return caches.match('./');
          }
        });
      })
  );
});
