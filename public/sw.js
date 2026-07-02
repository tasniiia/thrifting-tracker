// Thrift I/O service worker
//
// What this actually does: caches same-origin GET requests (the HTML shell,
// JS/CSS chunks, the manifest, icons) using a stale-while-revalidate
// strategy, so the app can load with zero network connectivity once it's
// been opened at least once on that device. It also makes the app
// installable ("Add to Home Screen").
//
// What this deliberately does NOT do: queue logged items for a later
// "sync to the database." This app has no backend database — every item,
// BOLO entry, and photo already lives entirely in localStorage on the
// device. That means logging a new find already works with zero network
// connectivity today, with or without this file; there is nothing to
// queue or sync, so a "pending sync" indicator would be showing a status
// that doesn't correspond to anything real. If a real backend is added
// later, an actual offline-write-queue would be worth building — this
// service worker's job for now is strictly "make the page itself loadable
// offline," which is the part that was genuinely missing.

const CACHE_NAME = "thrift-io-shell-v1";
const APP_SHELL = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        // Don't fail install if a shell asset is temporarily unavailable —
        // the fetch handler below will still cache things opportunistically.
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin GET requests. Cross-origin (e.g. Google Fonts
  // at build time are actually self-hosted by next/font, so this mostly
  // guards against anything unexpected) and non-GET requests pass through
  // untouched.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      // Stale-while-revalidate: serve the cached copy instantly if we have
      // one (fast, works offline), and refresh the cache in the background.
      return cached || networkFetch;
    })
  );
});
