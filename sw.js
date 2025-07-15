const cacheName = 'cache-v1';
const resourcesToPrecache = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './selectionMenu.js',
  './session.js',
  './calculations.js',
  './stats.js',
  './lmao.png'
];


// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(resourcesToPrecache);
      })
  );
});


// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== cacheName)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});


// Fetch event - serve from cache or fallback
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request)
    .then(cachedResponse => {
        return cachedResponse || fetch(event.request);
    })
  );
});