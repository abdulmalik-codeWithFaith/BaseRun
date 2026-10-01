const VERSION = "baserun-v1"; // bump to purge old caches after a release
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const STATIC_FILE = /\.(png|ico|svg|webmanifest|json|mp3|ogg|wav|glb|woff2?)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((c) => c.addAll(["/"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

const timeout = (ms) => new Promise((_, reject) => setTimeout(reject, ms));

// Pages: try the network, fall back to cache (and give up on a bad connection after 3.5 s).
async function networkFirst(req) {
  const cache = await caches.open(PAGES);
  const cached = (await cache.match(req)) || (await cache.match("/"));
  try {
    const fresh = fetch(req);
    fresh.catch(() => {});
    const res = cached ? await Promise.race([fresh, timeout(3500)]) : await fresh;
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return cached || Response.error();
  }
}

// Hashed build files never change, so cache-first is safe.
async function cacheFirst(req) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(req);
  const refresh = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || refresh;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(req));
  } else if (!url.pathname.startsWith("/_next/") && STATIC_FILE.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(req));
  }
});