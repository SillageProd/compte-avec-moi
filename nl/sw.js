// Fonctionnement hors ligne : l'app est gardée en cache, la synchronisation est toujours en direct.
const CACHE = "tel-met-mij-20261028184538";
const BASE = ["./", "index.html", "manifest.webmanifest", "icone-180.png", "icone-192.png", "icone-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("tel-met-mij-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // seulement l'app elle-même et ses polices ; jamais Google Apps Script (synchronisation toujours en direct)
  const garder = url.origin === self.location.origin || ["fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname);
  if (e.request.method !== "GET" || !garder || url.pathname.endsWith("version.json")) return;
  // la page : d'abord le réseau (pour les mises à jour), sinon le cache
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put("index.html", c)); return r; }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => {
    if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); }
    return r;
  })));
});
