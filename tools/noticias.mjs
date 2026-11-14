#!/usr/bin/env node
/* =====================================================================
   NOTÍCIAS DO MUNDO CRISTÃO — coletor do SOLA
   ---------------------------------------------------------------------
   Roda no GitHub Actions (.github/workflows/noticias.yml) a cada 3 horas.
   1. Lê os feeds (RSS/Atom) de seminários reformados, ministérios de
      missões e de igreja perseguida, e buscas do Google Notícias.
   2. Classifica: Missões · Igreja perseguida · Seminários · Igreja no mundo.
   3. Traduz para o português (títulos e resumos em outras línguas) pelo
      tradutor do SOLA (Worker no Cloudflare), reaproveitando o que já foi
      traduzido nas rodadas anteriores.
   4. Grava noticias/feed.json — o app mostra em Estudos › Notícias.
   Sempre deixa uma notícia de MISSÕES/PERSEGUIÇÃO em destaque.
   Só guardamos título, resumo curto (do próprio feed) e o link da fonte.
   Uso local: node tools/noticias.mjs
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "noticias", "feed.json");
const TRADUTOR = process.env.SOLA_TRADUTOR || "https://tradutor.rafael-ximenes-2010.workers.dev/";
const DIAS = 21, POR_FONTE = 6, MAX = 90;

const gn = (q, lang) => lang === "pt"
  ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}+when:14d&hl=pt-BR&gl=BR&ceid=BR:pt-419`
  : `https://news.google.com/rss/search?q=${encodeURIComponent(q)}+when:14d&hl=en-US&gl=US&ceid=US:en`;

/* cat: sem = seminários reformados · mis = missões · per = igreja perseguida · igr = igreja no mundo
   urls: tenta em ordem; a primeira que responder com itens vale */
const FONTES = [
  // Seminários reformados (mundo)
  { nome: "Westminster Theological Seminary", pais: "EUA", cat: "sem", urls: ["https://www.wts.edu/feed", "https://www.wts.edu/rss.xml", "https://www.wts.edu/feed/"] },
  { nome: "Reformed Theological Seminary", pais: "EUA", cat: "sem", urls: ["https://rts.edu/feed/", "https://rts.edu/news/feed/"] },
  { nome: "Westminster Seminary California", pais: "EUA", cat: "sem", urls: ["https://www.wscal.edu/feed", "https://www.wscal.edu/feed/"] },
  { nome: "Puritan Reformed Theological Seminary", pais: "EUA", cat: "sem", urls: ["https://www.prts.edu/feed/", "https://prts.edu/feed/"] },
  { nome: "Covenant Theological Seminary", pais: "EUA", cat: "sem", urls: ["https://www.covenantseminary.edu/feed/"] },
  { nome: "Mid-America Reformed Seminary", pais: "EUA", cat: "sem", urls: ["https://www.midamerica.edu/feed", "https://www.midamerica.edu/blog-feed.xml"] },
  { nome: "Greenville Presbyterian Theological Seminary", pais: "EUA", cat: "sem", urls: ["https://gpts.edu/feed/"] },
  { nome: "Southern Baptist Theological Seminary", pais: "EUA", cat: "sem", urls: ["https://news.sbts.edu/feed/"] },
  { nome: "Calvin Theological Seminary", pais: "EUA", cat: "sem", urls: ["https://www.calvinseminary.edu/feed/"] },
  { nome: "Union School of Theology", pais: "Reino Unido", cat: "sem", urls: ["https://ust.ac.uk/feed/"] },
  { nome: "Theologische Universiteit Kampen", pais: "Holanda", cat: "sem", urls: ["https://www.tukampen.nl/feed/", "https://www.tukampen.nl/nieuws/feed/"] },
  { nome: "Mukhanyo Theological College", pais: "África do Sul", cat: "sem", urls: ["https://mukhanyo.ac.za/feed/"] },
  { nome: "Seminários reformados (Google Notícias)", cat: "sem", lang: "en", gnews: true, urls: [gn('"Reformed seminary" OR "Reformed Theological Seminary" OR "Westminster Seminary"', "en")] },
  { nome: "Seminários no Brasil (Google Notícias)", cat: "sem", lang: "pt", gnews: true, urls: [gn('"seminário presbiteriano" OR "Andrew Jumper" OR "seminário teológico" reformado', "pt")] },
  // Igreja reformada / evangélica no mundo
  { nome: "The Gospel Coalition", pais: "EUA", cat: "igr", urls: ["https://www.thegospelcoalition.org/feed/"] },
  { nome: "Christianity Today", pais: "EUA", cat: "igr", urls: ["https://www.christianitytoday.com/feed/", "https://www.christianitytoday.com/ct/rss.xml"] },
  { nome: "Coalizão pelo Evangelho", pais: "Brasil", cat: "igr", lang: "pt", urls: ["https://coalizaopeloevangelho.org/feed/"] },
  { nome: "Ultimato", pais: "Brasil", cat: "igr", lang: "pt", urls: ["https://www.ultimato.com.br/feed", "https://ultimato.com.br/feed/"] },
  // Missões
  { nome: "Mission Network News", pais: "EUA", cat: "mis", urls: ["https://www.mnnonline.org/feed", "https://www.mnnonline.org/news/feed"] },
  { nome: "IMB", pais: "EUA", cat: "mis", urls: ["https://www.imb.org/feed/"] },
  { nome: "Movimento de Lausanne", pais: "Internacional", cat: "mis", urls: ["https://lausanne.org/feed", "https://lausanne.org/feed/"] },
  { nome: "Missões (Google Notícias)", cat: "mis", lang: "pt", gnews: true, urls: [gn('missionários OR "missões transculturais" OR "povos não alcançados" OR "tradução da Bíblia"', "pt")] },
  { nome: "Missions (Google News)", cat: "mis", lang: "en", gnews: true, urls: [gn('missionaries OR "unreached people" OR "Bible translation" OR "church planting"', "en")] },
  // Igreja perseguida
  { nome: "Portas Abertas", pais: "Brasil", cat: "per", lang: "pt", urls: ["https://portasabertas.org.br/feed", "https://portasabertas.org.br/noticias/feed/"] },
  { nome: "Open Doors", pais: "Internacional", cat: "per", urls: ["https://www.opendoors.org/en-US/news/rss/", "https://www.opendoorsuk.org/news/feed/"] },
  { nome: "Morning Star News", pais: "Internacional", cat: "per", urls: ["https://morningstarnews.org/feed/"] },
  { nome: "International Christian Concern", pais: "EUA", cat: "per", urls: ["https://www.persecution.org/feed/"] },
  { nome: "Release International", pais: "Reino Unido", cat: "per", urls: ["https://releaseinternational.org/feed/"] },
  { nome: "Barnabas Aid", pais: "Reino Unido", cat: "per", urls: ["https://www.barnabasaid.org/feed/"] },
  { nome: "Igreja perseguida (Google Notícias)", cat: "per", lang: "pt", gnews: true, urls: [gn('"perseguição aos cristãos" OR "cristãos perseguidos" OR "igreja perseguida"', "pt")] },
  { nome: "Persecuted Church (Google News)", cat: "per", lang: "en", gnews: true, urls: [gn('"persecuted Christians" OR "Christian persecution" OR "Christians killed"', "en")] }
];

const PER = /persegu|perseguid|martír|mártir|martyr|persecut|imprison|jailed|preso|prisão|arrested|abducted|sequestr|kidnap|attack|atacad|massacre|killed|mortos|assassin|blasphemy|blasfêmia|church burned|igreja queimada|tortur|refugiad|displaced/i;
const MIS = /miss(ion|ões|ão|ionár)|unreached|não alcançad|bible translation|tradução da bíblia|church plant|plantação de igrejas|evangeli[sz]|gospel to|tribo|indígena|unengaged|frontier/i;
/* Países onde a perseguição é mais severa (Lista Mundial da Perseguição, nomes em pt e en) */
const PAISES = [["Coreia do Norte","North Korea"],["Somália","Somalia"],["Iêmen","Yemen"],["Líbia","Libya"],["Sudão","Sudan"],["Eritreia","Eritrea"],["Nigéria","Nigeria"],["Paquistão","Pakistan"],["Irã","Iran"],["Afeganistão","Afghanistan"],["Índia","India"],["Arábia Saudita","Saudi Arabia"],["Myanmar","Myanmar"],["Mali","Mali"],["China","China"],["Maldivas","Maldives"],["Iraque","Iraq"],["Síria","Syria"],["Argélia","Algeria"],["Burkina Faso","Burkina Faso"],["Laos","Laos"],["Cuba","Cuba"],["Marrocos","Morocco"],["Mauritânia","Mauritania"],["Bangladesh","Bangladesh"],["Uzbequistão","Uzbekistan"],["Vietnã","Vietnam"],["Nicarágua","Nicaragua"],["Egito","Egypt"],["Etiópia","Ethiopia"],["Moçambique","Mozambique"],["Camarões","Cameroon"],["Níger","Niger"],["Turcomenistão","Turkmenistan"],["Tajiquistão","Tajikistan"],["Butão","Bhutan"],["Omã","Oman"],["Catar","Qatar"],["Turquia","Turkey"],["Colômbia","Colombia"],["República Centro-Africana","Central African Republic"],["Congo","Congo"],["Indonésia","Indonesia"]];

const dec = s => String(s || "")
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&#8217;|&rsquo;/g, "’")
  .replace(/&#8216;|&lsquo;/g, "‘").replace(/&#8220;|&ldquo;/g, "“").replace(/&#8221;|&rdquo;/g, "”").replace(/&#8211;|&ndash;/g, "–").replace(/&#8212;|&mdash;/g, "—").replace(/&#8230;|&hellip;/g, "…")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/\s+/g, " ").trim();
const tag = (xml, t) => { const m = xml.match(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>`, "i")); return m ? m[1] : ""; };
const attr = (xml, t, a) => { const m = xml.match(new RegExp(`<${t}\\b[^>]*\\b${a}="([^"]+)"`, "i")); return m ? m[1] : ""; };
const resumo = (t, n = 220) => { t = dec(t); return t.length > n ? t.slice(0, t.lastIndexOf(" ", n)) + "…" : t; };

function parse(xml){
  const blocos = xml.match(/<item\b[\s\S]*?<\/item>/gi) || xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  return blocos.map(b => {
    let link = dec(tag(b, "link")) || attr(b, "link", "href");
    if (!/^https?:/.test(link)) link = attr(b, "link", "href") || dec(tag(b, "guid"));
    const data = dec(tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date"));
    return { titulo: dec(tag(b, "title")), link, data: data ? new Date(data) : null,
             desc: tag(b, "description") || tag(b, "summary") || tag(b, "content:encoded") || tag(b, "content"),
             fonte: dec(tag(b, "source")), fonteUrl: attr(b, "source", "url") };
  }).filter(x => x.titulo && /^https?:/.test(x.link));
}

async function baixar(url){
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(url, { signal: ctl.signal, redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (compatible; SOLA-Noticias/1.0; +https://solabiblia.net.br)", "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const txt = await r.text(); if (!/<(rss|feed|rdf)/i.test(txt.slice(0, 2000))) throw new Error("não é feed");
    return txt;
  } finally { clearTimeout(t); }
}

function classificar(f, titulo, texto){
  const s = titulo + " " + texto;
  if (f.cat === "per" || PER.test(s)) return "per";
  if (f.cat === "mis" || MIS.test(s)) return f.cat === "sem" ? "sem" : "mis";
  return f.cat;
}
const paisDe = s => { for (const [pt, en] of PAISES) if (new RegExp(`\\b(${pt}|${en})\\b`, "i").test(s)) return pt; return ""; };
const normT = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 70);

async function traduzir(texto){
  const r = await fetch(TRADUTOR, { method: "POST", headers: { "Content-Type": "application/json", "Origin": "https://solabiblia.net.br" },
    body: JSON.stringify({ text: texto, from: "en", to: "pt" }) });
  const j = await r.json(); if (!r.ok || typeof j.text !== "string") throw new Error(j.error || r.status); return j.text;
}

const anterior = (() => { try { return JSON.parse(fs.readFileSync(OUT, "utf8")); } catch { return { itens: [] }; } })();
const jaTraduzido = new Map((anterior.itens || []).filter(x => x.orig).map(x => [x.url, x]));
const limite = Date.now() - DIAS * 86400e3;
const relatorio = [], itens = [], vistos = new Set();

for (const f of FONTES) {
  let ok = null, erro = "";
  for (const u of f.urls) { try { ok = parse(await baixar(u)); if (ok.length) break; } catch (e) { erro = e.message; ok = null; } }
  if (!ok || !ok.length) { relatorio.push(`✗ ${f.nome}: ${erro || "sem itens"}`); continue; }
  let n = 0;
  for (const x of ok.sort((a, b) => (b.data || 0) - (a.data || 0))) {
    if (n >= POR_FONTE) break;
    if (x.data && +x.data < limite) continue;
    let titulo = x.titulo, fonte = f.nome, fonteUrl = "";
    if (f.gnews) { const m = titulo.match(/^(.*) - ([^-]+)$/); if (m) { titulo = m[1].trim(); fonte = m[2].trim(); } fonte = x.fonte || fonte; fonteUrl = x.fonteUrl; }
    const k = normT(titulo); if (vistos.has(k)) continue; vistos.add(k);
    const desc = f.gnews ? "" : resumo(x.desc);
    const cat = classificar(f, titulo, desc);
    itens.push({ id: "n" + crypto.createHash("sha1").update(x.link).digest("hex").slice(0, 12), cat, titulo, resumo: desc, url: x.link, fonte, fonteUrl,
                 pais: paisDe(titulo + " " + desc) || f.pais || "", data: (x.data && !isNaN(x.data) ? x.data : new Date()).toISOString(),
                 lang: f.lang || "en" });
    n++;
  }
  relatorio.push(`✓ ${f.nome}: ${n} notícia(s)`);
}

/* Ordem: mais recentes primeiro, limitando a MAX, mas garantindo espaço para missões e perseguição */
itens.sort((a, b) => b.data.localeCompare(a.data));
const final = [];
for (const c of ["per", "mis"]) final.push(...itens.filter(x => x.cat === c).slice(0, 25));
for (const x of itens) if (final.length < MAX && !final.includes(x)) final.push(x);
final.sort((a, b) => b.data.localeCompare(a.data));

/* Tradução para o português (reaproveita as anteriores) */
let traduzidos = 0;
for (const x of final) {
  if (x.lang === "pt") continue;
  const velho = jaTraduzido.get(x.url);
  if (velho && velho.orig === x.titulo) { x.orig = velho.orig; x.titulo = velho.titulo; x.resumo = velho.resumo; x.lang = "pt"; x.traduzido = true; continue; }
  try {
    const sep = "\n\n§§§\n\n";
    const t = await traduzir(x.titulo + (x.resumo ? sep + x.resumo : ""));
    const [tt, rr] = t.split(/\s*§§§\s*/);
    x.orig = x.titulo; x.titulo = (tt || x.titulo).trim(); if (x.resumo) x.resumo = (rr || x.resumo).trim(); x.lang = "pt"; x.traduzido = true; traduzidos++;
  } catch (e) { relatorio.push(`  (tradução falhou: ${e.message})`); }
}

/* Destaque: a notícia mais recente de missões ou igreja perseguida (prioriza países de perseguição) */
const cand = final.filter(x => x.cat === "per" || x.cat === "mis");
const destaque = cand.find(x => x.cat === "per" && PAISES.some(([pt]) => pt === x.pais)) || cand[0] || null;

const saida = { atualizado: new Date().toISOString(), destaque: destaque ? destaque.id : null,
  categorias: { mis: "Missões", per: "Igreja perseguida", sem: "Seminários reformados", igr: "Igreja no mundo" },
  fontes: FONTES.map(f => f.nome), itens: final };
console.log(relatorio.join("\n"));
if (!final.length) { console.log("Nenhuma notícia obtida; mantendo o arquivo anterior."); process.exit(0); }
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(saida, null, 1));
console.log(`\n${final.length} notícias · ${traduzidos} traduzidas agora · destaque: ${destaque ? destaque.titulo : "—"}`);
