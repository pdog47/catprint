// Network first, cache fallback: online you always get the latest app, offline (theme park, no signal) it still opens.
// Same-origin GETs only, so GitHub API calls for the feed are never cached here.
const C = 'catprint-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.add('./'))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const net = fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; });
  const slow = new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 4000)); // bad park wifi: don't hang
  e.respondWith(Promise.race([net, slow]).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || net)));
});
