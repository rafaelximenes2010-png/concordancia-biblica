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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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
  const voice = VOICES.includes(body.voice) ? body.voice : (env.SPEECH_VOICE || VOICES[0]);
  const rate = /^-?\d{1,2}%$/.test(body.rate||"") ? body.rate : "-4%";
  if (!text.trim()) return json({ error: "empty" }, 400, h);
  const key = `tts2:${voice}:${rate}:${await sha(text)}`;
  if (env.TR_CACHE) { const hit = await env.TR_CACHE.get(key, "arrayBuffer"); if (hit) return new Response(hit, { headers: { ...h, "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=31536000" } }); }
  let r = await synth(text, voice, rate, env);
  // Se a voz escolhida não existir nesta região, usa o Antônio
  if (!r.ok && r.status !== 429 && r.status !== 403 && voice !== "pt-BR-AntonioNeural") r = await synth(text, "pt-BR-AntonioNeural", rate, env);
  if (r.status === 429 || r.status === 403) return json({ error: "quota" }, 429, h);
  if (!r.ok) return json({ error: "upstream", status: r.status }, 502, h);
  const audio = await r.arrayBuffer();
  if (env.TR_CACHE) await env.TR_CACHE.put(key, audio);   // cada devocional é gerado uma única vez
  return new Response(audio, { headers: { ...h, "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=31536000" } });
}

export default {
  async fetch(request, env) {
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
