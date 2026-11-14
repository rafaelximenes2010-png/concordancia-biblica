/* Service worker: guarda o app e as Bíblias baixadas para funcionar offline.
   Ao publicar uma nova versão, altere CACHE (ex.: v5) para forçar a atualização. */
const CACHE = "sola-v108";
const BIBLES = "concordancia-biblias-v1"; // separado: não é apagado a cada atualização do app
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./biblias/index.json", "./docs/index.json",
  "./icons/icon.svg", "./icons/favicon-64.png", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/mark.svg", "./icons/apple-touch-180.png", "./icons/og-sola.png", "./icons/favicon-32.png", "./icons/badge-96.png", "./devocionais/series.json", "./icons/qr-instalar.svg", "./artigos/sola.json", "./ouvir/spotify.json"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== BIBLES && k !== "sola-inbox").map(k => caches.delete(k)))));
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

/* Notificações push (devocional, versão nova, avisos): chegam com o app fechado */
self.addEventListener("push", e => {
  let m = {}; try { m = e.data ? e.data.json() : {}; } catch (err) { m = { body: e.data ? e.data.text() : "" }; }
  const title = m.title || "SOLA | Bíblia & Teologia";
  const opt = { body: m.body || "", icon: "icons/apple-touch-180.png?v=3", badge: "icons/badge-96.png?v=3",
    tag: m.tag || m.kind || "sola", data: { url: m.url || "./index.html#inicio", kind: m.kind || "aviso" }, renotify: !!m.tag };
  e.waitUntil((async () => {
    await self.registration.showNotification(title, opt);
    // Guarda na central de notificações do app e acende o número no ícone
    const c = await caches.open("sola-inbox"); const r = await c.match("inbox"); const list = r ? await r.json() : [];
    list.unshift({ id: (m.tag || "p") + "-" + Date.now(), kind: m.kind || "aviso", title, body: m.body || "", url: opt.data.url, date: new Date().toISOString() });
    await c.put("inbox", new Response(JSON.stringify(list.slice(0, 40))));
    try { if (self.navigator.setAppBadge) await self.navigator.setAppBadge(Math.min(list.length, 9)); } catch (err) {}
    (await self.clients.matchAll({ type: "window" })).forEach(w => w.postMessage({ type: "push", item: list[0] }));
  })());
});

// Ao tocar na notificação, abre (ou foca) o app na seção certa
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./index.html#devocional";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) { if ("focus" in c) { c.navigate && c.navigate(url); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
