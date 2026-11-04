// Služba za rad kao instalirana aplikacija. Podaci iz baze se NE spremaju ovdje.
const CACHE = 'lager-v1';
const ASSETS = ['./', './index.html', './nord.html', './sued.html',
  './manifest-nord.webmanifest', './manifest-sued.webmanifest',
  './icon-nord-192.png', './icon-nord-512.png', './icon-sued-192.png', './icon-sued-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Prvo mreža (da se nove verzije odmah učitaju), a bez interneta zadnja sačuvana verzija.
self.addEventListener('fetch', function (e) {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, copy); }); }
    return res;
  }).catch(function () { return caches.match(r).then(function (m) { return m || caches.match('./index.html'); }); }));
});
