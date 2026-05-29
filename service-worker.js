const CACHE_NAME = "hac-idris-v3";

const urlsToCache = [
  "/",
  "/index.html",
  "/arabic.html",
  "/style.css",
  "/app.js",
  "/logo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});