// Service worker : cache hors-ligne pour la version web (GitHub Pages).
// Le nom du cache dépend de APP_VERSION : chaque nouvelle version remplace l'ancienne.
importScripts("version.js");

const CACHE = "happik-runner-" + APP_VERSION;
const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "version.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-180.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Stratégie : réponse immédiate depuis le cache (rapide même sans réseau à la salle),
// et mise à jour du cache en arrière-plan pour récupérer les nouvelles versions.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request);
      const refresh = fetch(e.request)
        .then(resp => {
          if (resp.ok) cache.put(e.request, resp.clone());
          return resp;
        })
        .catch(() => cached);
      return cached || refresh;
    })
  );
});
