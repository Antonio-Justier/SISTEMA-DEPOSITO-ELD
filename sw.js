// Service Worker — El Dourado Ferramentas
// Cache-first com fallback de rede, e atualização em background

const CACHE_VERSION = 'eldourado-v1';
const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// CDN libs — cacheadas na primeira visita online
const CDN_PATTERNS = [
  /cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf/,
  /cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas/
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const isCDN = CDN_PATTERNS.some(p => p.test(req.url));
  const isSameOrigin = new URL(req.url).origin === self.location.origin;

  if (!isSameOrigin && !isCDN) return; // não interfere em outras requisições

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Atualiza em background
        fetch(req).then(resp => {
          if (resp && resp.status === 200) {
            caches.open(CACHE_VERSION).then(c => c.put(req, resp.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      // Não tem em cache → busca da rede e cacheia
      return fetch(req).then(resp => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        }
        return resp;
      }).catch(() => {
        // Sem rede e sem cache → falha silenciosa (libs já cacheadas continuam funcionando)
        return new Response('', { status: 503 });
      });
    })
  );
});
