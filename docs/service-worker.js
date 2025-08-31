// service-worker.js (پیشنهادی)
const CACHE_VERSION = 'v1::' + Date.now();
const CACHE_NAME = `mysite-${CACHE_VERSION}`;
const OFFLINE_URLS = [
  './',
  './index.html'
];

self.addEventListener('install', (event) => {
  // preload offline page into cache
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // clear old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Helper: safe fetch that falls back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    // if response is OK, update cache and return it
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    }
    // non-ok (e.g., 404) -> try cache
    const cached = await caches.match(request);
    return cached || response;
  } catch (e) {
    const cached = await caches.match(request);
    return cached || caches.match('./index.html');
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // HTML navigation -> network-first
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(networkFirst(req));
    return;
  }

  // for other GET requests: cache-first, then network, fallback nothing
  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(resp => {
          // only cache successful responses (optional)
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return resp;
        }).catch(() => cached); // if fetch fails and no cache -> undefined
      })
    );
  }
});
