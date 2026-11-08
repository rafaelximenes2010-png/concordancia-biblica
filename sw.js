/* Service worker: guarda os arquivos do app para funcionar offline.
   Ao publicar uma nova versão, altere CACHE (ex.: v2) para forçar a atualização. */
const CACHE = "concordancia-v2";
const FILES = ["./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return; // links externos passam direto
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
