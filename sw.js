/**
 * High-Performance Service Worker (newpyt · VSČHT Praha)
 * Enables sub-10ms instant warm loading, offline support, and intelligent caching.
 */

const CACHE_NAME = "pyt-v2-cache-v1";

const CORE_SHELL_ASSETS = [
  "/",
  "/app/index.html",
  "/app/favicon.svg",
  "/app/css/tokens.css",
  "/app/css/shell.css",
  "/app/css/lecture.css",
  "/app/css/slides.css",
  "/app/css/exercises.css",
  "/app/css/quiz.css",
  "/app/css/content.css",
  "/app/css/syntax.css",
  "/app/css/print.css",
  "/app/js/app.js",
  "/app/js/router.js",
  "/app/js/state.js",
  "/app/js/content.js",
  "/app/js/tree.js",
  "/app/js/quiz.js",
  "/app/js/format.js",
  "/app/js/editor.js",
  "/app/js/profile.js",
  "/app/js/admin.js",
  "/app/js/ui.js",
  "/app/fonts/ibm-plex-sans-latin-400-normal.woff2",
  "/app/fonts/jetbrains-mono-latin-400-normal.woff2",
  "/data/course.json"
];

// Install: Precache core application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_SHELL_ASSETS).catch((err) => {
        console.warn("[SW] Precache partial failure:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Optimized routing strategies
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET requests and external third-party endpoints
  if (req.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // 1. Static Assets (CSS, JS, Fonts, Images) -> Cache-First
  if (
    url.pathname.startsWith("/app/") ||
    url.pathname.startsWith("/cjs/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((networkRes) => {
          if (networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // 2. Course Data & Lectures (JSON) -> Stale-While-Revalidate
  if (url.pathname.startsWith("/data/")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes.status === 200) {
              const copy = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            }
            return networkRes;
          })
          .catch(() => cached); // Fallback to cache on network failure

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 3. HTML Navigation / Root -> Network-First with Cache Fallback
  if (req.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkRes;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("/")))
    );
  }
});
