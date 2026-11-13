/* =====================================================================
   Ponte de tradução e voz do app "SOLA | Bíblia & Teologia"
   ---------------------------------------------------------------------
   Roda grátis no Cloudflare Workers. Recebe um texto do app, traduz com o
   Microsoft Translator (plano gratuito F0) e guarda cada tradução no KV,
   para que o mesmo trecho nunca precise ser traduzido (e cobrado) de novo.

   Configuração no painel do Cloudflare (Settings › Variables and Secrets):
     AZURE_KEY     (Secret)  chave do recurso Translator no Azure
     AZURE_REGION  (Text)    região do recurso, ex.: brazilsouth ou eastus
     ALLOWED       (Text, opcional) origens permitidas, separadas por vírgula
     TG_TOKEN      (Secret)  token do robô do Telegram (do @BotFather)
     TG_CHANNEL    (Text)    canal do Telegram, ex.: @solabiblia
   Gatilho Cron (Settings › Triggers › Cron Triggers): 0,15,30,45 * * * *
     = a cada 15 minutos: posta o devocional no Telegram (uma vez, a partir das 5h
       de Brasília), envia as notificações push do devocional no horário escolhido
       por cada pessoa e avisa sobre versões novas do app.
     PUSH_ADMIN    (Secret, opcional) senha da página de envio de avisos
                   (site/enviar-aviso.html). Sem ela, vale a senha do teste do
                   Telegram: os 6 últimos caracteres do TG_TOKEN.
   Ligação (Bindings) KV opcional, mas recomendada:
     TR_CACHE      namespace KV para guardar as traduções
   ===================================================================== */

const DEFAULT_ALLOWED = [
  "https://solabiblia.net.br",
  "https://www.solabiblia.net.br",
  "https://rafaelximenes2010-png.github.io",
  "https://concordanciabiblica.github.io",
  "https://comentariosbiblicos.github.io",
  "http://localhost:8781"
];
const MAX_CHARS = 30000;                       // por pedido
const LANG = { pt: "pt", "pt-br": "pt", en: "en", es: "es", fr: "fr", de: "de", nl: "nl", ru: "ru",
               zh: "zh-Hans", he: "he", el: "el", grc: "el", hu: "hu", pl: "pl", sv: "sv", la: "la" };

function cors(origin, env) {
  const list = (env.ALLOWED ? env.ALLOWED.split(",").map(s => s.trim()) : DEFAULT_ALLOWED);
  const ok = list.includes(origin) || /\.claudeusercontent\.com$|\.claude\.ai$/.test(new URL(origin || "http://x").hostname);
  return {
    "Access-Control-Allow-Origin": ok ? origin : list[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
const json = (obj, status, headers) =>
  new Response(JSON.stringify(obj), { status, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } });

async function sha(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

/* Divide em blocos de até ~9.000 caracteres, sem cortar parágrafos ao meio quando possível */
function chunks(text, size = 9000) {
  const out = []; let cur = "";
  for (const par of text.split(/(\n+)/)) {
    if ((cur + par).length > size && cur) { out.push(cur); cur = ""; }
    if (par.length > size) { for (let i = 0; i < par.length; i += size) out.push(par.slice(i, i + size)); }
    else cur += par;
  }
  if (cur) out.push(cur);
  return out;
}

async function azure(texts, from, to, env) {
  const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${encodeURIComponent(to)}` +
              (from ? `&from=${encodeURIComponent(from)}` : "");
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": env.AZURE_KEY,
      "Ocp-Apim-Subscription-Region": env.AZURE_REGION || "global",
      "Content-Type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(texts.map(Text => ({ Text })))
  });
  if (r.status === 429 || r.status === 403) throw new Error("quota");
  if (!r.ok) throw new Error("azure " + r.status);
  const d = await r.json();
  return d.map(x => x.translations?.[0]?.text || "");
}

/* ---------- Voz natural (Azure Speech, voz masculina neural pt-BR) ---------- */
const VOICES = ["pt-BR-MacerioMultilingualNeural","pt-BR-AntonioNeural","pt-BR-FabioNeural","pt-BR-HumbertoNeural","pt-BR-JulioNeural","pt-BR-NicolauNeural","pt-BR-ValerioNeural","pt-BR-DonatoNeural"];
const FEMALE = /Francisca|Thalita|Brenda|Elza|Giovanna|Leila|Leticia|Manuela|Yara/;
const xml = t => t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
/* Leitura de locutor: frases marcadas, pausas de respiração depois de títulos e
   entre parágrafos, ritmo calmo e sem alterar o tom natural da voz. */
function ssml(text, voice, rate){
  const paras = text.split(/\n{2,}/).map(p=>p.trim()).filter(Boolean);
  const body = paras.map((p,i)=>{
    const sents = (p.match(/[^.!?…]+[.!?…”"]*\s*/g) || [p]).map(x=>x.trim()).filter(Boolean);
    const heading = sents.length === 1 && p.length <= 45;   // títulos curtos ("Para pensar.")
    const inner = sents.map(x=>`<s>${xml(x)}</s>`).join("");
    const pause = i===0 ? "1100ms" : heading ? "650ms" : "950ms";
    return (heading ? `<prosody rate="-8%">${inner}</prosody>` : inner) + `<break time="${pause}"/>`;
  }).join("");
  const inner = `<prosody rate="${rate}">${body}</prosody>`;
  const content = /Multilingual/.test(voice) ? `<lang xml:lang="pt-BR">${inner}</lang>` : inner;  // sotaque brasileiro garantido
  return `<speak version="1.0" xml:lang="pt-BR" xmlns="http://www.w3.org/2001/10/synthesis"><voice name="${voice}">${content}</voice></speak>`;
}
async function synth(text, voice, rate, env){
  return fetch(`https://${env.SPEECH_REGION || "brazilsouth"}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": env.SPEECH_KEY, "Content-Type": "application/ssml+xml",
               "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3", "User-Agent": "sola-biblia" },
    body: ssml(text, voice, rate)
  });
}
async function tts(request, env, h){
  if (!env.SPEECH_KEY) return json({ error: "config", message: "SPEECH_KEY não configurada" }, 500, h);
  let body; try { body = await request.json(); } catch { return json({ error: "json" }, 400, h); }
  const text = String(body.text || "").slice(0, 9000);
  const voice = (VOICES.includes(body.voice) || /^pt-BR-[A-Za-z]+Neural$/.test(body.voice||"")) ? body.voice : (env.SPEECH_VOICE || VOICES[0]);
  const rate = /^-?\d{1,2}%$/.test(body.rate||"") ? body.rate : "-4%";
  if (!text.trim()) return json({ error: "empty" }, 400, h);
  const key = `tts2:${voice}:${rate}:${await sha(text)}`;
  if (env.TR_CACHE) { const hit = await env.TR_CACHE.get(key, "arrayBuffer"); if (hit) return new Response(hit, { headers: { ...h, "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=31536000" } }); }
  let r = await synth(text, voice, rate, env);
  // Se a voz escolhida não existir nesta região, usa a Francisca (feminina) ou o Antônio (masculina)
  const reserva = FEMALE.test(voice) ? "pt-BR-FranciscaNeural" : "pt-BR-AntonioNeural";
  if (!r.ok && r.status !== 429 && r.status !== 403 && voice !== reserva) r = await synth(text, reserva, rate, env);
  if (r.status === 429 || r.status === 403) return json({ error: "quota" }, 429, h);
  if (!r.ok) return json({ error: "upstream", status: r.status }, 502, h);
  const audio = await r.arrayBuffer();
  if (env.TR_CACHE) await env.TR_CACHE.put(key, audio);   // cada devocional é gerado uma única vez
  return new Response(audio, { headers: { ...h, "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=31536000" } });
}

/* ---------- Devocional diário no Canal do Telegram ---------- */
const SITE = "https://solabiblia.net.br/";
function brToday(){ return new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); }   // Brasília (UTC-3)
async function tg(env, method, payload){
  const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const j = await r.json(); if (!j.ok) throw new Error(`${method}: ${j.description}`); return j;
}
async function postDevocional(env, force){
  if (!env.TG_TOKEN || !env.TG_CHANNEL) return "Configure TG_TOKEN e TG_CHANNEL.";
  const day = brToday(), flag = "tg-posted:" + day;
  if (!force && new Date(Date.now() - 3 * 3600e3).getUTCHours() < 5) return "Antes das 5h.";
  if (!force && env.TR_CACHE && await env.TR_CACHE.get(flag)) return "Já postado hoje.";
  const r = await fetch(`${SITE}devocionais/canal/${day.slice(0, 7)}.json`, { cf: { cacheTtl: 300 } });
  if (!r.ok) return "Mês ainda sem devocionais publicados.";
  const item = (await r.json())[day]; if (!item) return "Sem devocional para hoje.";
  const photo = SITE + item.img + "?v=" + day;
  const plain = item.caption.replace(/<[^>]+>/g, "");
  if (plain.length <= 1024) {
    await tg(env, "sendPhoto", { chat_id: env.TG_CHANNEL, photo, caption: item.caption, parse_mode: "HTML" });
  } else {
    await tg(env, "sendPhoto", { chat_id: env.TG_CHANNEL, photo });
    await tg(env, "sendMessage", { chat_id: env.TG_CHANNEL, text: item.caption, parse_mode: "HTML", link_preview_options: { is_disabled: true } });
  }
  if (env.TR_CACHE) await env.TR_CACHE.put(flag, "1", { expirationTtl: 3 * 86400 });
  return "Postado: " + item.title;
}

/* =====================================================================
   NOTIFICAÇÕES PUSH (Web Push) — aparecem na tela do celular com o app
   fechado: devocional do dia, versões novas e avisos do SOLA.
   ---------------------------------------------------------------------
   Sem configuração extra: as chaves VAPID são criadas pelo próprio Worker
   na primeira vez e guardadas no KV (TR_CACHE). Cada inscrição fica em
   push:sub:<hash> com os dados nos metadados (uma listagem lê todas).
   Rotas:  GET  /push/key          chave pública para o app se inscrever
           POST /push/subscribe    { sub, time:"07:30", topics:{devo,versao,aviso} }
           POST /push/unsubscribe  { endpoint }
           POST /push/test         { endpoint } notificação de teste no próprio aparelho
           GET  /push/feed         últimos avisos (central de notificações do app)
           POST /push/send         { k, title, body, url, topic } (administrador)
           GET  /push/status?k=…   contagem de inscritos (administrador)
   ===================================================================== */
const B64 = {
  enc(buf){ const b = new Uint8Array(buf); let s = ""; for (const x of b) s += String.fromCharCode(x);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); },
  dec(str){ const s = atob(String(str).replace(/-/g, "+").replace(/_/g, "/") + "===".slice((String(str).length + 3) % 4));
    return Uint8Array.from(s, c => c.charCodeAt(0)); }
};
const te = new TextEncoder();
const cat = (...a) => { const out = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let o = 0; for (const x of a) { out.set(x, o); o += x.length; } return out; };
async function hmac(key, data){ const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data)); }

/* Chaves VAPID: criadas uma vez e guardadas no KV */
let VAPID = null;
async function vapid(env){
  if (VAPID) return VAPID;
  let v = env.TR_CACHE ? await env.TR_CACHE.get("push:vapid", "json") : null;
  if (!v) {
    const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    v = { jwk: await crypto.subtle.exportKey("jwk", kp.privateKey), pub: B64.enc(await crypto.subtle.exportKey("raw", kp.publicKey)) };
    if (env.TR_CACHE) await env.TR_CACHE.put("push:vapid", JSON.stringify(v));
  }
  v.key = await crypto.subtle.importKey("jwk", v.jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  return VAPID = v;
}
async function vapidAuth(endpoint, env){
  const v = await vapid(env), aud = new URL(endpoint).origin;
  const head = B64.enc(te.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = B64.enc(te.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.PUSH_CONTACT || "https://solabiblia.net.br/" })));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, v.key, te.encode(head + "." + body));
  return `vapid t=${head}.${body}.${B64.enc(sig)}, k=${v.pub}`;
}

/* Criptografia da mensagem (RFC 8291, aes128gcm) */
async function encrypt(payload, p256dh, auth){
  const ua = B64.dec(p256dh), secret = B64.dec(auth);
  const eph = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", eph.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, eph.privateKey, 256));
  const prkKey = await hmac(secret, shared);
  const ikm = await hmac(prkKey, cat(te.encode("WebPush: info\0"), ua, asPub, new Uint8Array([1])));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, cat(te.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, cat(te.encode("Content-Encoding: nonce\0"), new Uint8Array([1])))).slice(0, 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, cat(te.encode(payload), new Uint8Array([2]))));
  const header = new Uint8Array(21); header.set(salt, 0); new DataView(header.buffer).setUint32(16, 4096); header[20] = 65;
  return cat(header, asPub, ct);
}
async function sendPush(s, msg, env){
  const r = await fetch(s.e, { method: "POST", headers: {
      "Authorization": await vapidAuth(s.e, env), "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream",
      "TTL": String(msg.ttl || 86400), "Urgency": msg.urgency || "normal", ...(msg.tag ? { "Topic": msg.tag.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32) } : {}) },
    body: await encrypt(JSON.stringify(msg), s.p, s.a) });
  return r.status;
}

/* Inscrições */
async function subKey(endpoint){ return "push:sub:" + (await sha(endpoint)).slice(0, 32); }
function slotOf(time){ const m = /^(\d{1,2}):(\d{2})$/.exec(time || "") || [0, 7, 30]; return { h: Math.min(23, +m[1]), q: Math.floor(Math.min(59, +m[2]) / 15) }; }
async function allSubs(env){
  const out = []; let cursor;
  do {
    const page = await env.TR_CACHE.list({ prefix: "push:sub:", cursor });
    for (const k of page.keys) { const m = k.metadata || await env.TR_CACHE.get(k.name, "json"); if (m && m.e) out.push({ ...m, key: k.name }); }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return out;
}

/* Envia para uma lista, respeitando o limite de pedidos por execução; o resto vai para a fila */
const BUDGET = 40;
async function deliver(env, subs, msg, ctx){
  let sent = 0, gone = 0, i = 0;
  for (; i < subs.length && ctx.left > 0; i++) {
    ctx.left--;
    try { const st = await sendPush(subs[i], msg, env);
      if (st === 404 || st === 410) { gone++; await env.TR_CACHE.delete(subs[i].key); } else if (st < 300) sent++; }
    catch (e) { console.log("push", e.message); }
  }
  return { sent, gone, rest: subs.slice(i).map(s => s.key) };
}
async function enqueue(env, msg, keys){
  if (!keys.length) return;
  const q = await env.TR_CACHE.get("push:queue", "json") || [];
  q.push({ msg, keys }); await env.TR_CACHE.put("push:queue", JSON.stringify(q));
}
async function drainQueue(env, ctx){
  const q = await env.TR_CACHE.get("push:queue", "json"); if (!q || !q.length) return;
  const left = [];
  for (const job of q) {
    if (ctx.left <= 0) { left.push(job); continue; }
    const subs = []; for (const k of job.keys) { const m = await env.TR_CACHE.get(k, "json"); if (m) subs.push({ ...m, key: k }); }
    const r = await deliver(env, subs, job.msg, ctx);
    if (r.rest.length) left.push({ msg: job.msg, keys: r.rest });
  }
  if (left.length) await env.TR_CACHE.put("push:queue", JSON.stringify(left)); else await env.TR_CACHE.delete("push:queue");
}
async function broadcast(env, msg, topic, ctx){
  const subs = (await allSubs(env)).filter(s => !s.t || s.t[topic] !== false);
  const r = await deliver(env, subs, msg, ctx); await enqueue(env, msg, r.rest);
  return { total: subs.length, ...r, rest: r.rest.length };
}

/* Central de notificações: últimos 30 avisos */
async function addFeed(env, item){
  const f = await env.TR_CACHE.get("push:feed", "json") || [];
  f.unshift({ id: item.id || ("a" + Date.now()), kind: item.kind, title: item.title, body: item.body, url: item.url, date: new Date().toISOString() });
  await env.TR_CACHE.put("push:feed", JSON.stringify(f.slice(0, 30)));
}

/* Versão nova: compara o sw.js publicado (pequeno) e, se mudou, lê a versão e a novidade no index.html */
async function checkVersion(env, ctx){
  const sw = await fetch(SITE + "sw.js?t=" + Date.now()).then(r => r.ok ? r.text() : "").catch(() => "");
  const cache = (sw.match(/const CACHE = "([^"]+)"/) || [])[1]; if (!cache) return;
  if (await env.TR_CACHE.get("push:swcache") === cache) return;
  await env.TR_CACHE.put("push:swcache", cache);
  const html = await fetch(SITE + "index.html?t=" + Date.now()).then(r => r.ok ? r.text() : "").catch(() => "");
  const ver = (html.match(/const APP_VERSION = "([^"]+)"/) || [])[1]; if (!ver) return;
  const last = await env.TR_CACHE.get("push:version");
  await env.TR_CACHE.put("push:version", ver);
  if (!last || last === ver) return;                    // primeira vez: só registra, não avisa
  const esc = ver.replace(/\./g, "\\.");
  const item = (html.match(new RegExp(`v:"${esc}"[^\\n]*?items:\\["((?:[^"\\\\]|\\\\.)*)"`)) || [])[1] || "Melhorias e correções.";
  const body = item.replace(/\\"/g, '"').replace(/\s+/g, " ");
  const msg = { kind: "versao", title: `SOLA ${ver} chegou`, body: body.length > 170 ? body.slice(0, 167) + "…" : body,
                url: "./index.html#config", tag: "versao", ttl: 7 * 86400 };
  await addFeed(env, { ...msg, id: "v" + ver });
  await broadcast(env, msg, "versao", ctx);
}

/* Devocional no horário de cada pessoa (blocos de 15 minutos, horário de Brasília) */
async function devoTick(env, ctx){
  const br = new Date(Date.now() - 3 * 3600e3), h = br.getUTCHours(), q = Math.floor(br.getUTCMinutes() / 15), day = brToday();
  const flag = `push:devo:${day}:${h}:${q}`;
  if (await env.TR_CACHE.get(flag)) return;
  await env.TR_CACHE.put(flag, "1", { expirationTtl: 86400 });
  const subs = (await allSubs(env)).filter(s => s.t && s.t.devo && s.h === h && s.q === q);
  if (!subs.length) return;
  let title = "Devocional de hoje", ref = "";
  try {
    const d = await fetch(`${SITE}devocionais/${day.slice(0, 7)}.json`, { cf: { cacheTtl: 3600 } }).then(r => r.json());
    const it = (d.days || []).find(x => x.day === +day.slice(8)); if (it) { title = it.title; ref = it.ref || ""; }
  } catch {}
  const msg = { kind: "devo", title: "Hora do seu tempo com a Palavra", body: `Devocional de hoje: ${title}`, ref,
                url: "./index.html#devocional", tag: "devo-" + day, ttl: 6 * 3600 };
  const r = await deliver(env, subs, msg, ctx); await enqueue(env, msg, r.rest);
}

async function pushTick(env){
  if (!env.TR_CACHE) return;
  const ctx = { left: BUDGET };
  await drainQueue(env, ctx);
  await devoTick(env, ctx);
  await checkVersion(env, ctx);
}

function isAdmin(k, env){ return !!k && ((env.PUSH_ADMIN && k === env.PUSH_ADMIN) || (env.TG_TOKEN && k === env.TG_TOKEN.slice(-6))); }

async function pushRoute(request, env, h){
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  if (!env.TR_CACHE) return json({ error: "config", message: "Ligue o KV TR_CACHE no Worker." }, 500, h);
  const path = new URL(request.url).pathname, qs = new URL(request.url).searchParams;
  if (path === "/push/key") return json({ key: (await vapid(env)).pub }, 200, { ...h, "Cache-Control": "public, max-age=3600" });
  if (path === "/push/feed") return json({ items: await env.TR_CACHE.get("push:feed", "json") || [] }, 200, { ...h, "Cache-Control": "public, max-age=300" });
  if (path === "/push/status") {
    if (!isAdmin(qs.get("k"), env)) return json({ error: "auth" }, 403, h);
    const subs = await allSubs(env);
    return json({ inscritos: subs.length, devocional: subs.filter(s => s.t?.devo).length, fila: (await env.TR_CACHE.get("push:queue", "json") || []).length,
                  versao: await env.TR_CACHE.get("push:version") }, 200, h);
  }
  if (request.method !== "POST") return json({ error: "method" }, 405, h);
  let b; try { b = await request.json(); } catch { return json({ error: "json" }, 400, h); }
  if (path === "/push/subscribe") {
    const s = b.sub || {}, e = String(s.endpoint || ""), p = s.keys?.p256dh, a = s.keys?.auth;
    if (!/^https:\/\//.test(e) || !p || !a || e.length > 800) return json({ error: "sub" }, 400, h);
    const { h: hh, q } = slotOf(b.time), t = { devo: b.topics?.devo !== false, versao: b.topics?.versao !== false, aviso: b.topics?.aviso !== false };
    const meta = { e, p, a, h: hh, q, t, d: brToday() };
    const key = await subKey(e), str = JSON.stringify(meta);
    await env.TR_CACHE.put(key, str, str.length < 1000 ? { metadata: meta } : {});
    return json({ ok: true }, 200, h);
  }
  if (path === "/push/test") {                         // "Testar notificação": só para o próprio aparelho
    const subs = (await allSubs(env)).filter(x => x.e === String(b.endpoint || ""));
    if (!subs.length) return json({ error: "nao-inscrito" }, 404, h);
    const st = await sendPush(subs[0], { kind: "aviso", title: "SOLA | Bíblia & Teologia", body: "Pronto! As notificações estão chegando neste aparelho.", url: "./index.html#config", tag: "teste" }, env);
    return json({ ok: st < 300, status: st }, 200, h);
  }
  if (path === "/push/unsubscribe") { if (b.endpoint) await env.TR_CACHE.delete(await subKey(String(b.endpoint))); return json({ ok: true }, 200, h); }
  if (path === "/push/send") {
    if (!isAdmin(b.k, env)) return json({ error: "auth" }, 403, h);
    const title = String(b.title || "").slice(0, 80).trim(), body = String(b.body || "").slice(0, 240).trim();
    if (!title) return json({ error: "title" }, 400, h);
    const topic = ["aviso", "versao", "devo"].includes(b.topic) ? b.topic : "aviso";
    const msg = { kind: topic, title, body, url: /^\.\/index\.html#[a-z0-9-]*$/i.test(b.url || "") ? b.url : "./index.html#inicio", tag: "aviso-" + Date.now(), ttl: 3 * 86400 };
    if (b.test) { const subs = (await allSubs(env)).filter(s => s.e === b.endpoint); const r = await deliver(env, subs, msg, { left: 5 }); return json({ ok: true, teste: true, ...r, rest: 0 }, 200, h); }
    if (b.feed !== false) await addFeed(env, msg);
    return json({ ok: true, ...await broadcast(env, msg, topic, { left: BUDGET }) }, 200, h);
  }
  return json({ error: "rota" }, 404, h);
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      await postDevocional(env, false).catch(e => console.log("telegram", e.message));
      await pushTick(env).catch(e => console.log("push", e.message));
    })());
  },
  async fetch(request, env) {
    const u0 = new URL(request.url);
    if (u0.pathname.startsWith("/push/")) return pushRoute(request, env, cors(request.headers.get("Origin") || "", env));
    if (u0.pathname === "/telegram/teste") {             // teste manual: /telegram/teste?k=<últimos 6 caracteres do TG_TOKEN>
      if (!env.TG_TOKEN || u0.searchParams.get("k") !== env.TG_TOKEN.slice(-6)) return new Response("Não autorizado.", { status: 403 });
      try { return new Response(await postDevocional(env, u0.searchParams.get("forcar") === "1"), { headers: { "Content-Type": "text/plain; charset=utf-8" } }); }
      catch (e) { return new Response("Erro: " + e.message, { status: 502, headers: { "Content-Type": "text/plain; charset=utf-8" } }); }
    }
    const origin = request.headers.get("Origin") || "";
    const h = cors(origin, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (request.method === "POST" && new URL(request.url).pathname.endsWith("/tts")) return tts(request, env, h);
    if (request.method === "GET") return json({ ok: true, service: "tradutor-comentarios-biblicos" }, 200, h);
    if (request.method !== "POST") return json({ error: "method" }, 405, h);
    if (!env.AZURE_KEY) return json({ error: "config", message: "AZURE_KEY não configurada" }, 500, h);

    let body; try { body = await request.json(); } catch { return json({ error: "json" }, 400, h); }
    const text = String(body.text || "");
    const from = LANG[String(body.from || "en").toLowerCase()] ?? String(body.from || "");
    const to = LANG[String(body.to || "pt").toLowerCase()] ?? "pt";
    if (!text.trim()) return json({ text: "" }, 200, h);
    if (text.length > MAX_CHARS) return json({ error: "size" }, 413, h);

    const key = `v1:${from}>${to}:${await sha(text)}`;
    if (env.TR_CACHE) {
      const hit = await env.TR_CACHE.get(key);
      if (hit !== null) return json({ text: hit, cached: true }, 200, h);
    }
    try {
      const parts = chunks(text);
      const out = [];
      for (let i = 0; i < parts.length; i += 20) {           // até 20 blocos por chamada
        out.push(...await azure(parts.slice(i, i + 20), from, to, env));
      }
      const result = out.join("");
      if (env.TR_CACHE) await env.TR_CACHE.put(key, result);  // guardado para sempre
      return json({ text: result, cached: false }, 200, h);
    } catch (e) {
      return json({ error: e.message === "quota" ? "quota" : "upstream" }, e.message === "quota" ? 429 : 502, h);
    }
  }
};
