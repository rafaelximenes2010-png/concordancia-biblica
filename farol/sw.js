// Farol Operacional — service worker: abre offline com o app e os últimos dados
const CACHE="farol-v4"; const APP=["./","index.html","instalar.html","icons/qr-instalar.svg","parser.js","vendor/pdf.min.mjs","vendor/pdf.worker.min.mjs","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET")return;
  // dados da API: rede primeiro, cópia em cache para uso offline
  if(u.pathname.includes("/api/")||u.pathname.endsWith(".enc")){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request)));return;}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
