// sw.js — service worker minimal pour Tablée (cache offline)
const CACHE = 'tablee-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data.js',
  './llm.js',
  './manifest.webmanifest',
  './icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Ne pas cacher les appels API (Anthropic, etc.) ni les fonts CDN
  if (url.origin !== location.origin) return;
  // Pour les fichiers applicatifs, préférer le réseau (network-first)
  const networkFirst = ['/app.js', '/data.js', '/llm.js', '/', '/index.html'];
  if (networkFirst.includes(url.pathname)) {
    e.respondWith(
      fetch(e.request).then(res => {
        if (e.request.method === 'GET' && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Par défaut : cache-first pour ressources statiques
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        if (e.request.method === 'GET' && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached)
    )
  );
});
