/* =====================================================================
   SOLA — tradução definitiva dos CONTEÚDOS para inglês e espanhol
   ---------------------------------------------------------------------
   Gera cópias traduzidas de cada arquivo de conteúdo em
       i18n/conteudo/<idioma>/<mesmo caminho>
   e o app as usa automaticamente quando o idioma é English ou Español
   (i18n/i18n.js troca o endereço; se faltar a cópia, cai no original).

   Fontes: devocionais, artigos, mapas, credos/confissões/catecismos,
   saltério, notícias, Ouvir (Spotify) e os textos de conteúdo que
   ficam dentro do index.html (vão para i18n/src/mt-<idioma>.json e
   entram no catálogo pelo tools/i18n-build.py; as traduções escritas à
   mão em i18n/src/*.tsv têm prioridade).

   Tradução: Microsoft Translator pela ponte do SOLA (tradutor/worker.js).
   Memória de tradução em i18n/conteudo/<idioma>/_memoria.json: um texto
   já traduzido nunca é enviado de novo. Se a cota acabar, o script para
   sem erro e a próxima execução continua de onde parou.
   Documentos com original em inglês (aEn, qEn, original) usam o próprio
   original em inglês e são traduzidos a partir dele para o espanhol.

   Uso: node tools/traduzir-conteudo.mjs            (en e es)
        node tools/traduzir-conteudo.mjs es         (só um idioma)
   ===================================================================== */
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PONTE = process.env.TR_PROXY || "https://tradutor.rafael-ximenes-2010.workers.dev";
const IDIOMAS = process.argv.slice(2).filter(a => /^(en|es)$/.test(a));
const ALVOS = IDIOMAS.length ? IDIOMAS : ["en", "es"];
const PARALELO = 6;

/* Arquivos de conteúdo (iguais ao padrão CONTEUDO de i18n/i18n.js) */
function fontes() {
  const lista = [];
  const add = (p) => { if (fs.existsSync(path.join(ROOT, p))) lista.push(p); };
  for (const f of fs.readdirSync(path.join(ROOT, "devocionais"))) if (/^\d{4}-\d{2}\.json$|^series\.json$/.test(f)) add("devocionais/" + f);
  add("artigos/sola.json"); add("mapas/dados.json"); add("mapas/base.json");
  for (const f of fs.readdirSync(path.join(ROOT, "docs"))) if (f.endsWith(".json")) add("docs/" + f);
  for (const f of fs.readdirSync(path.join(ROOT, "salterio"))) if (f.endsWith(".json")) add("salterio/" + f);
  add("noticias/feed.json"); add("ouvir/spotify.json");
  return lista;
}

/* Campos que nunca se traduzem (identificadores, links, códigos, nomes próprios) */
const NUNCA = new Set(["id", "ref", "r", "url", "art", "mes", "month", "status", "data", "dia", "p", "img", "tint", "glow", "lang", "source", "kind",
  "icon", "cor", "color", "mel", "code", "author", "autor", "fonte", "cat", "pais", "tipo", "n", "c", "day", "min", "t0", "land", "lakes", "rivers",
  "coords", "x0", "y0", "lat", "lon", "uri", "spotify", "destaque", "usados", "log", "atualizado", "verif", "orig", "titleEn", "qEn", "aEn",
  "original", "ctEn", "tEn", "year", "license", "palette", "relatorio", "link", "links_url", "voz", "audio", "mp3", "arquivo", "path", "d", "z"]);
const pulaValor = s => !/[A-Za-zÀ-ú]{2}/.test(s) || /^(https?:|bib:|doc:|#|mailto:|tel:)/.test(s) || /^[MLHVCZmlhvcz0-9 .,-]+$/.test(s)
  || /^#?[0-9a-f]{3,8}$/i.test(s) || /^\d{4}-\d{2}(-\d{2})?/.test(s) || /^[1-3]?[A-Z]{2,3}[ .]\d/.test(s) || (!/\s/.test(s) && /^[a-z0-9_-]+$/.test(s));

const sha = s => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
let semCota = false, chamadas = 0, caracteres = 0;

async function traduzirTexto(texto, de, para, memoria) {
  const k = de + ">" + para + ":" + sha(texto);
  if (memoria[k] != null) return memoria[k];
  if (semCota || process.env.OFFLINE) return null;
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      const r = await fetch(PONTE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: texto, from: de, to: para }) });
      if (r.status === 429) { semCota = true; return null; }
      if (!r.ok) throw new Error("http " + r.status);
      const j = await r.json(); if (j.error) throw new Error(j.error);
      chamadas++; caracteres += texto.length;
      memoria[k] = j.text; return j.text;
    } catch (e) { await new Promise(res => setTimeout(res, 1500 * (tentativa + 1))); }
  }
  return null;
}
/* Texto longo com parágrafos e títulos "## ": traduz parágrafo por parágrafo, preservando a marcação */
async function traduzirLongo(texto, de, para, memoria) {
  const partes = texto.split(/(\n{2,})/);
  const out = await Promise.all(partes.map(async p => {
    if (!p.trim() || /^\n+$/.test(p)) return p;
    const m = p.match(/^(#{1,4} |[-*] |\d+\. )?([\s\S]*)$/);
    const t = await traduzirTexto(m[2], de, para, memoria);
    return t == null ? null : (m[1] || "") + t;
  }));
  return out.some(x => x == null) ? null : out.join("");
}

/* Percorre o JSON e devolve a lista de lugares a traduzir */
function coletar(o, cam, achados, irmaoEn) {
  if (Array.isArray(o)) { o.forEach((v, i) => { if (typeof v === "string") { if (!pulaValor(v)) achados.push({ obj: o, k: i, src: v }); } else coletar(v, cam.concat(i), achados); }); return; }
  if (!o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) {
    if (NUNCA.has(k)) continue;
    if (typeof v === "string") { if (!pulaValor(v)) achados.push({ obj: o, k, src: v, en: o[k + "En"] || (k === "t" && typeof o.original === "string" ? null : null) }); }
    else coletar(v, cam.concat(k), achados);
  }
}

async function traduzirArquivo(rel, para, memoria) {
  const orig = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
  const doc = JSON.parse(JSON.stringify(orig));
  const docEn = doc && doc.lang === "en";                 // confissões com original em inglês
  /* Documentos com original em inglês ao lado do português (qEn/aEn/ctEn/titleEn/original) */
  const usaEn = (o, k) => o && typeof o[k + "En"] === "string" && o[k + "En"].trim() ? o[k + "En"] : null;
  const achados = []; coletar(doc, [], achados);
  let faltam = 0;
  const fila = achados.slice();
  async function trabalhador() {
    while (fila.length) {
      const a = fila.shift();
      const en = usaEn(a.obj, a.k);
      let r = null;
      if (para === "en" && (en || docEn)) r = en || a.src;                       // já existe em inglês
      else if (en) r = await traduzirLongo(en, "en", para, memoria);             // espanhol a partir do original inglês
      else r = await traduzirLongo(a.src, docEn ? "en" : "pt", para, memoria);
      if (r == null) faltam++; else a.obj[a.k] = r;
    }
  }
  await Promise.all(Array.from({ length: PARALELO }, trabalhador));
  /* Credos: o texto em inglês ("original") passa a ser o texto principal na versão em inglês */
  if (para === "en" && typeof doc.original === "string" && Array.isArray(doc.items) && doc.items.length === 1 && doc.items[0].t) doc.items[0].t = doc.original;
  if (para === "en" && doc.titleEn) doc.title = doc.titleEn;
  /* Notícias: em inglês usa o título original quando a matéria era em inglês */
  if (rel === "noticias/feed.json" && para === "en") for (const d of doc.dias || []) for (const x of d.itens || []) if (x.orig) x.titulo = x.orig;
  if (typeof orig.translation === "string") {
    const temEn = docEn || JSON.stringify(orig).includes('"aEn"') || typeof orig.original === "string";
    doc.translation = para === "en" && temEn ? "Original English text (public domain)."
      : para === "en" ? "Automatic translation into English (Microsoft Translator), from the Portuguese text prepared by SOLA."
      : "Traducción automática al español (Microsoft Translator) a partir del " + (temEn ? "original en inglés." : "texto en portugués preparado por SOLA.");
  }
  if (doc && typeof doc === "object" && !Array.isArray(doc)) doc._i18n = { idioma: para, origem: rel, traducao: "SOLA (revisada) e Microsoft Translator (automática) nos trechos ainda sem revisão", faltam };
  const destino = path.join(ROOT, "i18n", "conteudo", para, rel);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, JSON.stringify(doc));
  return { achados: achados.length, faltam };
}

/* Textos de conteúdo dentro do index.html (pensadores, estudos, temas, hinos…) */
function textosDoApp() {
  const s = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const js = [...s.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join("\n");
  const set = new Set();
  for (const m of js.matchAll(/"((?:[^"\\\n]|\\.){3,600})"/g)) set.add(m[1]);
  for (const m of js.matchAll(/`((?:[^`\\]|\\.)*)`/g)) for (const f of m[1].replace(/\$\{(?:[^{}]|\{[^{}]*\})*\}/g, "\u0000").split(/<[^>]*>|\u0000/)) set.add(f);
  const html = s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, "");
  for (const m of html.matchAll(/>([^<>]{3,600})</g)) set.add(m[1]);
  const out = [];
  for (let t of set) {
    t = t.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\s+/g, " ").trim().replace(/^[·—–:,\s]+|[·—–:,\s]+$/g, "");
    if (t.length < 3 || !/[a-zà-ú]{3}/.test(t) || !/\s|[ãõçáéíóúâêôà]/.test(t)) continue;
    if (/[{};=<>]|=>|\(\)|https?:|^\.|\.(json|svg|png|js|mp3)\b|^[a-z-]+:[a-z]|querySelector|function|return |var\(|px\b|rgba?\(/.test(t)) continue;
    out.push(t);
  }
  return [...new Set(out)];
}

const relatorio = [];
for (const para of ALVOS) {
  const dirMem = path.join(ROOT, "i18n", "conteudo", para);
  fs.mkdirSync(dirMem, { recursive: true });
  const arqMem = path.join(dirMem, "_memoria.json");
  const memoria = fs.existsSync(arqMem) ? JSON.parse(fs.readFileSync(arqMem, "utf8")) : {};
  const salvar = () => fs.writeFileSync(arqMem, JSON.stringify(memoria));
  for (const rel of fontes()) {
    const r = await traduzirArquivo(rel, para, memoria); salvar();
    relatorio.push(`${para} ${rel}: ${r.achados} textos${r.faltam ? `, ${r.faltam} pendentes` : ""}`);
  }
  /* catálogo de textos de conteúdo do app */
  const manual = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, "i18n", para + ".json"), "utf8")).strings || {}));
  const textos = textosDoApp().filter(t => !manual.has(t));
  const arqMt = path.join(ROOT, "i18n", "src", "mt-" + para + ".json");
  const mt = fs.existsSync(arqMt) ? JSON.parse(fs.readFileSync(arqMt, "utf8")) : {};
  const fila = textos.filter(t => mt[t] == null); let pend = 0;
  await Promise.all(Array.from({ length: PARALELO }, async () => { while (fila.length) { const t = fila.shift(); const r = await traduzirTexto(t, "pt", para, memoria); if (r == null) pend++; else mt[t] = r; } }));
  fs.writeFileSync(arqMt, JSON.stringify(mt, null, 0)); salvar();
  relatorio.push(`${para} textos do app: ${Object.keys(mt).length} traduzidos${pend ? `, ${pend} pendentes` : ""}`);
}
console.log(relatorio.join("\n"));
console.log(`chamadas novas ao tradutor: ${chamadas} · ${caracteres} caracteres${semCota ? " · COTA ESGOTADA: a próxima execução continua" : ""}`);
