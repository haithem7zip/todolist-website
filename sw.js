const CACHE_NAME = 'my-tasks-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// installation and cache
self.addEventListener('install', event => {
  console.log('Service Worker: Installed');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// request management
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching');
  event.respondWith(
    fetch(event.request)
      .then(res => {
        // copy answer
        const resClone = res.clone();
        // open cache
        caches.open(CACHE_NAME)
          .then(cache => {
            // respond cache
            cache.put(event.request, resClone);
          });
        return res;
      })
      .catch(() => caches.match(event.request).then(res => res))
  );

});
