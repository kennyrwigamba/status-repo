const CACHE_NAME = "status-reposter-cache-v2";
const URLS_TO_CACHE = ["/", "/index.html", "/assets/css/style.css", "/assets/js/script.js", "/assets/js/modal.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
