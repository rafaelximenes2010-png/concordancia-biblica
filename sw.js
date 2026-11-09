/* Service worker: guarda o app e as Bíblias baixadas para funcionar offline.
   Ao publicar uma nova versão, altere CACHE (ex.: v5) para forçar a atualização. */
const CACHE = "sola-v80";
const BIBLES = "concordancia-biblias-v1"; // separado: não é apagado a cada atualização do app
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./biblias/index.json", "./docs/index.json",
  "./icons/icon.svg", "./icons/favicon-64.png", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/mark.svg", "./icons/apple-touch-180.png", "./icons/og-sola.png", "./icons/favicon-32.png", "./icons/badge-96.png", "./devocionais/series.json", "./icons/qr-instalar.svg", "./artigos/sola.json"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== BIBLES).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Comentários (bible.helloao.org): guarda os já abertos para leitura offline
  if (url.hostname === "bible.helloao.org") {
    e.respondWith(caches.open(BIBLES).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok) c.put(e.request, res.clone()); return res;
    }))));
    return;
  }
  if (url.origin !== location.origin) return; // outros links externos passam direto
  const isBible = /\/biblias\/(?!index\.json)[^/]+\.json$/.test(url.pathname);
  if (isBible) {
    // Bíblias: usa a cópia guardada; se não houver, baixa e guarda
    e.respondWith(caches.open(BIBLES).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok) c.put(e.request, res.clone()); return res;
    }))));
    return;
  }
  // App: rede primeiro (para receber atualizações), cópia guardada se estiver offline
  // Página e arquivos do app sempre conferidos no servidor (ignora o cache de 10 min do GitHub Pages)
  const fresh = e.request.mode === "navigate" || /(\/|\.html|\.webmanifest|index\.json|devocionais\/[^/]+\.json|artigos\/[^/]+\.json)$/.test(url.pathname);
  const req = fresh ? fetch(url.href, { cache: "no-cache", credentials: "same-origin" }) : fetch(e.request);
  e.respondWith(req.then(res => {
    if (res.ok) { const copy=res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request).then(r => r || caches.match(e.request, { ignoreSearch: true })).then(r => {
    if (r) return r;
    // Imagens (ícones, farol): nunca devolver a página no lugar da imagem
    if (e.request.destination === "image") return new Response("", { status: 504 });
    return caches.match("./index.html");
  })));
});

// Ao tocar no lembrete, abre (ou foca) o app no devocional
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) { if ("focus" in c) { c.navigate && c.navigate("./index.html#devocional"); return c.focus(); } }
    return self.clients.openWindow("./index.html#devocional");
  }));
});
