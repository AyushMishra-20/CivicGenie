// The name of your cache. Update this version number when you want to force
// a new download of all assets.
const CACHE_NAME = 'civic-genie-cache-v1';

// A list of assets to cache on install.
// This should include all the files needed for the app to run offline.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // You would also list other static assets like
  // compiled JavaScript and CSS files here.
];

// The 'install' event is fired when the service worker is installed.
// This is where you cache all the required assets.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// The 'fetch' event is fired for every network request made from the app.
// This is where the service worker intercepts requests and serves cached content
// if available.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If a cached response is found, return it.
        if (response) {
          return response;
        }
        // Otherwise, fetch the resource from the network.
        return fetch(event.request);
      })
  );
});

// The 'activate' event is fired when the service worker is activated.
// This is a good place to clean up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
