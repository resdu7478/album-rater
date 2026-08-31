/* Service worker for My Album Rating Mode.
   Bump CACHE_VERSION on every deploy (keep it in step with APP_VERSION in
   index.html) so a new worker installs, the old cache is purged, and the app
   surfaces the "Update available — reload" prompt. */
const CACHE_VERSION = 'v1.4';
const CACHE = 'album-rater-' + CACHE_VERSION;
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  // Don't skipWaiting automatically — the page prompts the user, then tells us.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only handle our own origin. Spotify API/auth calls pass straight through —
  // they must never be cached or intercepted.
  if (url.origin !== self.location.origin) return;
  // Never cache the service worker script itself.
  if (url.pathname.endsWith('/sw.js')) return;

  if (req.mode === 'navigate') {
    // Network-first for the page so new deploys are picked up quickly; fall back
    // to cache when offline.
    e.respondWith(
      fetch(req)
        .then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r; })
        .catch(() => caches.match(req).then((m) => m || caches.match('./index.html')))
    );
    return;
  }
  // Cache-first for other same-origin assets.
  e.respondWith(caches.match(req).then((m) => m || fetch(req)));
});
