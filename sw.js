const CACHE = 'yato-service-hub-v20260605-drawing-viewer2';
const ASSETS = [
  './',
  './index.html',
  './assets/style.css?v=20260605-drawing-viewer2',
  './assets/app.js?v=20260605-drawing-viewer2',
  './assets/database.js?v=20260605-drawing-viewer2',
  './data/parts.json',
  './data/drawings.json',
  './data/devices.json',
  './data/config.json',
  './assets/logos/yato-wordmark-clean.png',
  './assets/logos/brands-strip-clean.png',
  './manifest.webmanifest'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => cached)));
});
