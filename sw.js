// sw.js — service worker minimal pour Tablée (cache offline)
const CACHE = 'tablee-v18';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './state.js',
  './dom.js',
  './render.js',
  './views.js',
  './modals.js',
  './actions.js',
  './pure.js',
  './data.js',
  './data-docs.js',
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
  e.waitUntil(install());
});

// Précache best-effort, puis activation immédiate.
//
// cache.addAll() est atomique : une seule ressource en échec — 404, coupure
// réseau d'une seconde, 5xx du CDN — rejetait l'installation *entière*. Le
// service worker restait alors sur l'ancienne version jusqu'à la prochaine
// vérification de mise à jour, et l'appareil pouvait se figer des semaines sur
// une version périmée. Chaque ressource est désormais mise en cache
// indépendamment : l'installation aboutit même si une partie échoue, quitte à
// avoir un cache hors-ligne incomplet. C'est sans conséquence en ligne, la
// stratégie de fetch étant network-first pour les fichiers applicatifs.
async function install() {
  const cache = await caches.open(CACHE);
  const results = await Promise.allSettled(
    // cache: 'reload' court-circuite le cache HTTP du navigateur : sans lui on
    // risque de « précacher » la version périmée qu'on cherche à remplacer.
    ASSETS.map(url => cache.add(new Request(url, { cache: 'reload' }))),
  );
  const failed = results.filter(r => r.status === 'rejected').length;
  if (failed) {
    console.warn(`[sw] ${CACHE} : ${failed}/${ASSETS.length} ressources non précachées, installation poursuivie`);
  }
  // Pas d'attente du bandeau utilisateur : le nouveau SW prend la main.
  await self.skipWaiting();
}

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
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

  // Fichiers applicatifs : network-first, sinon les corrections ne se propagent
  // jamais sur les appareils déjà installés (cache-first les figerait).
  // On teste l'extension plutôt qu'une liste de noms : une liste oubliait
  // fatalement les nouveaux modules (data-docs.js est passé à travers).
  const isAppFile =
    /\.(?:js|css|html|webmanifest)$/.test(url.pathname) ||
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
