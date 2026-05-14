// sw.js — service worker minimal pour Tablée (cache offline)
const CACHE = 'tablee-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data.js',
  './llm.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
];

// Origines tierces qu'on accepte de mettre en cache (stale-while-revalidate)
const CACHEABLE_THIRD_PARTY = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
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
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Ne jamais cacher les appels à l'API Gemini
  if (url.hostname === 'generativelanguage.googleapis.com') return;

  // Fonts Google (CDN) : stale-while-revalidate pour rester fonctionnel hors-ligne
  if (CACHEABLE_THIRD_PARTY.includes(url.origin)) {
    e.respondWith(staleWhileRevalidate(e.request));
    return;
  }

  // Hors origine et hors liste tierce autorisée : laisser passer
  if (url.origin !== location.origin) return;

  // Fichiers applicatifs : network-first (compare en endsWith pour supporter les sous-chemins)
  const networkFirst = ['/app.js', '/data.js', '/llm.js', '/index.html'];
  const isAppFile =
    networkFirst.some(p => url.pathname.endsWith(p)) ||
    url.pathname === '/' ||
    url.pathname.endsWith('/');
  if (isAppFile) {
    e.respondWith(networkFirstThenCache(e.request));
    return;
  }

  // Par défaut : cache-first pour ressources statiques
  e.respondWith(cacheFirst(e.request));
});

function networkFirstThenCache(req) {
  return fetch(req).then(res => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  }).catch(() => caches.match(req));
}

function cacheFirst(req) {
  return caches.match(req).then(cached =>
    cached || fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => cached)
  );
}

function staleWhileRevalidate(req) {
  return caches.open(CACHE).then(cache =>
    cache.match(req).then(cached => {
      const fetchPromise = fetch(req).then(res => {
        if (res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
}
