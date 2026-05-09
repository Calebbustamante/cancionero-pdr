const CACHE = 'cancionero-pdr-v2';
const ASSETS = ['./'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.includes('firebase') || e.request.url.includes('googleapis') || e.request.url.includes('gstatic') || e.request.url.includes('fonts')) return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(resp) {
        if (e.request.url.includes(self.location.origin)) {
          return caches.open(CACHE).then(function(c) { c.put(e.request, resp.clone()); return resp; });
        }
        return resp;
      }).catch(function() { return caches.match('./'); });
    })
  );
});
