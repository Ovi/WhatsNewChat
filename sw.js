'use strict';

// Static Files as version
const staticCacheVersion = 'v0.1.1';

// Files to cache
const files = [
  './',
  './app.html',
  './index.html',
  './country_selector/css/intlTelInput.min.css',
  './country_selector/img/flags.png',
  './country_selector/img/flags@2x.png',
  './country_selector/js/intlTelInput.min.js',
  './country_selector/js/utils.js',
  './css/app.css',
  './css/toastify.min.css',
  './images/fav.png',
  './images/logo-16.png',
  './images/logo-32.png',
  './images/logo-128.png',
  './images/logo-152.png',
  './images/logo-167.png',
  './images/logo-180.png',
  './images/logo-192.png',
  './images/logo-512.png',
  './images/logo.png',
  './fonts/Nunito/Nunito-300-1.woff2',
  './fonts/Nunito/Nunito-300-2.woff2',
  './fonts/Nunito/Nunito-300-3.woff2',
  './fonts/Nunito/Nunito-300-4.woff2',
  './fonts/Nunito/Nunito-300-5.woff2',
  './fonts/Nunito/Nunito-400-1.woff2',
  './fonts/Nunito/Nunito-400-2.woff2',
  './fonts/Nunito/Nunito-400-3.woff2',
  './fonts/Nunito/Nunito-400-4.woff2',
  './fonts/Nunito/Nunito-400-5.woff2',
  './js/script.js',
  './js/toastify.js',
  './manifest.json',
];

// Install
self.addEventListener('install', e => {
  self.skipWaiting();

  e.waitUntil(
    caches.open(staticCacheVersion).then(cache => {
      return cache
        .addAll(files)
        .then(() => console.log('App Version: ' + staticCacheVersion))
        .catch(err => console.error('Error adding files to cache', err));
    }),
  );
});

// Activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== staticCacheVersion) {
            console.info('Deleting Old Cache', cache);
            return caches.delete(cache);
          }
        }),
      );
    }),
  );

  return self.clients.claim();
});

const cacheFirstOrigins = [location.origin, 'https://ipinfo.io'];

// Fetch
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  if (cacheFirstOrigins.includes(url.origin)) {
    return e.respondWith(cacheFirst(req));
  }

  return e.respondWith(networkFirst(req));
});

async function cacheFirst(req) {
  const cacheRes = await caches.match(req);

  if (cacheRes && cacheRes.status === 200) {
    return cacheRes;
  }

  return fetch(req);
}

async function networkFirst(req) {
  try {
    const dynamicCache = await caches.open('dynamic');
    const networkResponse = await fetch(req);

    if (req.method !== 'POST') {
      dynamicCache.put(req, networkResponse.clone());
    }

    return networkResponse;
  } catch (err) {
    const cacheResponse = await caches.match(req);
    return cacheResponse;
  }
}
