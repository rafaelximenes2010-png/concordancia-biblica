#!/usr/bin/env node
/* =====================================================================
   NOTÍCIAS DO MUNDO CRISTÃO — coletor do SOLA
   ---------------------------------------------------------------------
   Roda no GitHub Actions (.github/workflows/noticias.yml) a cada 3 horas.
   1. Lê os feeds (RSS/Atom) de seminários reformados, ministérios de
      missões e de igreja perseguida, e buscas do Google Notícias.
   2. Classifica: Missões · Igreja perseguida · Seminários · Igreja no mundo.
   3. Traduz para o português só as escolhidas (tradutor do SOLA no
      Cloudflare; reserva: MyMemory).
   4. Todo dia escolhe as 5 matérias mais importantes de cada tipo e grava
      noticias/feed.json com os últimos 7 dias.
   Só guardamos título, resumo curto (do próprio feed) e o link da fonte.
   Uso local: node tools/noticias.mjs
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "noticias", "feed.json");
const TRADUTOR = process.env.SOLA_TRADUTOR || "https://tradutor.rafael-ximenes-2010.workers.dev/";
const DIAS = 10, POR_FONTE = 12;

const gn = (q, lang) => lang === "pt"
  ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}+when:30d&hl=pt-BR&gl=BR&ceid=BR:pt-419`
  : `https://news.google.com/rss/search?q=${encodeURIComponent(q)}+when:30d&hl=en-US&gl=US&ceid=US:en`;

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
  { nome: "Seminários reformados (Google Notícias)", cat: "sem", lang: "en", gnews: true, urls: [gn("site:wts.edu OR site:rts.edu OR site:prts.edu OR site:wscal.edu OR site:covenantseminary.edu OR site:sbts.edu OR site:calvinseminary.edu OR site:midamerica.edu", "en"), gn("Reformed seminary", "en")] },
  { nome: "Seminários (Google News)", cat: "sem", lang: "en", gnews: true, urls: [gn("seminary Presbyterian OR Reformed theology professor", "en")] },
  { nome: "Seminários no Brasil (Google Notícias)", cat: "sem", lang: "pt", gnews: true, urls: [gn("seminário presbiteriano", "pt"), gn("seminário teológico reformado", "pt")] },
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
const PAISES = [["Coreia do Norte","North Korea"],["Somália","Somalia"],["Iêmen","Yemen"],["Líbia","Libya"],["Sudão","Sudan"],["Eritreia","Eritrea"],["Nigéria","Nigeria"],["Paquistão","Pakistan"],["Irã","Iran"],["Afeganistão","Afghanistan"],["Índia","India"],["Arábia Saudita","Saudi Arabia"],["Myanmar","Myanmar"],["Mali","Mali"],["China","China"],["Maldivas","Maldives"],["Iraque","Iraq"],["Síria","Syria"],["Argélia","Algeria"],["Burkina Faso","Burkina Faso"],["Laos","Laos"],["Cuba","Cuba"],["Marrocos","Morocco"],["Mauritânia","Mauritania"],["Bangladesh","Bangladesh"],["Uzbequistão","Uzbekistan"],["Vietnã","Vietnam"],["Nicarágua","Nicaragua"],["Egito","Egypt"],["Etiópia","Ethiopia"],["Moçambique","Mozambique"],["Camarões","Cameroon"],["Níger","Niger"],["Turcomenistão","Turkmenistan"],["Tajiquistão","Tajikistan"],["Butão","Bhutan"],["Omã","Oman"],["Catar","Qatar"],["Turquia","Turkey"],["Colômbia","Colombia"],["República Centro-Africana","Central African Republic"],["Congo","Congo"],["Indonésia","Indonesia"],["Jordânia","Jordan"],["Líbano","Lebanon"],["Israel","Israel"],["Gaza","Gaza"],["Cisjordânia","West Bank"],["Ucrânia","Ukraine"],["Rússia","Russia"],["Sudão do Sul","South Sudan"],["Quênia","Kenya"],["Uganda","Uganda"],["Tanzânia","Tanzania"],["Chade","Chad"],["Azerbaijão","Azerbaijan"],["Cazaquistão","Kazakhstan"],["Sri Lanka","Sri Lanka"],["Nepal","Nepal"],["Brasil","Brazil"],["Haiti","Haiti"],["Venezuela","Venezuela"],["México","Mexico"]];

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
    const buf = Buffer.from(await r.arrayBuffer());
    const head = buf.subarray(0, 300).toString("latin1");
    const cs = ((r.headers.get("content-type") || "").match(/charset=([\w-]+)/i) || head.match(/encoding="([\w-]+)"/i) || [, "utf-8"])[1].toLowerCase();
    let txt = new TextDecoder(/8859-1|latin1|1252/.test(cs) ? "windows-1252" : "utf-8").decode(buf);
    if (txt.includes("\uFFFD")) txt = new TextDecoder("windows-1252").decode(buf);   // feed que se diz UTF-8 mas vem em latin1
    if (!/<(rss|feed|rdf)/i.test(txt.slice(0, 2000))) throw new Error("não é feed");
    return txt;
  } finally { clearTimeout(t); }
}

function classificar(f, titulo, texto){
  const s = titulo + " " + texto;
  if (f.cat === "sem") return "sem";
  if (PER.test(s) && /christ|crist|church|igreja|pastor|believer|crente|padre|priest|faith|fé/i.test(s)) return "per";
  if (MIS.test(s)) return "mis";
  return f.cat === "per" || f.cat === "mis" ? "igr" : f.cat;   // notícia de agência de missões sem tema de missão/perseguição vai para "igreja no mundo"
}
const paisDe = s => { for (const [pt, en] of PAISES) if (new RegExp(`\\b(${pt}|${en})\\b`, "i").test(s)) return pt; return ""; };
const normT = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 70);

const espera = ms => new Promise(r => setTimeout(r, ms));
async function viaWorker(texto){
  const r = await fetch(TRADUTOR, { method: "POST", headers: { "Content-Type": "application/json", "Origin": "https://solabiblia.net.br" },
    body: JSON.stringify({ text: texto, from: "en", to: "pt" }) });
  const j = await r.json().catch(() => ({})); if (!r.ok || typeof j.text !== "string") throw new Error(j.error || r.status); return j.text;
}
/* Reserva gratuita: MyMemory (até 500 caracteres por pedido) */
async function viaMyMemory(texto){
  const u = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto.slice(0, 480))}&langpair=en|pt-BR&de=contato@solabiblia.net.br`;
  const j = await (await fetch(u)).json();
  const t = j?.responseData?.translatedText; if (!t || j.responseStatus !== 200 || /MYMEMORY WARNING|QUERY LENGTH/i.test(t)) throw new Error("mymemory " + (j.responseStatus || "")); return t;
}
let workerOk = true;
async function traduzir1(texto){
  if (workerOk) {
    for (let k = 0; k < 2; k++) {
      try { const t = await viaWorker(texto); await espera(1200); return t; }
      catch (e) { if (e.message === "quota" && k === 0) { await espera(25000); continue; } workerOk = false; break; }
    }
  }
  const t = await viaMyMemory(texto); await espera(400); return t;
}
async function traduzir(texto){
  const [tt, rr] = texto.split("\n\n§§§\n\n");
  const a = await traduzir1(tt); const b = rr ? await traduzir1(rr) : "";
  return a + (rr ? "\n\n§§§\n\n" + b : "");
}

const anterior = (() => { try { return JSON.parse(fs.readFileSync(OUT, "utf8")); } catch { return { itens: [] }; } })();
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
    itens.push({ gnews: !!f.gnews, id: "n" + crypto.createHash("sha1").update(x.link).digest("hex").slice(0, 12), cat, titulo, resumo: desc, url: x.link, fonte, fonteUrl,
                 pais: paisDe(titulo + " " + desc) || (f.cat === "sem" || f.cat === "igr" ? f.pais || "" : ""), data: (x.data && !isNaN(x.data) ? x.data : new Date()).toISOString(),
                 lang: f.lang || "en" });
    n++;
  }
  relatorio.push(`✓ ${f.nome}: ${n} notícia(s)`);
}

/* =====================================================================
   SELEÇÃO DO DIA: as 5 matérias mais importantes de CADA TIPO
   (igreja perseguida, missões, seminários reformados, igreja no mundo),
   escolhidas uma vez por dia (a partir das 6h de Brasília).
   Destaque: igreja perseguida, de preferência em país da Lista Mundial.
   ===================================================================== */
const FORTE = /killed|mortos|morto|martyr|mártir|arrest|preso|presos|prisão|attack|atacad|sequestr|kidnap|abduct|massacre|burn|queimad|bible translation|tradução da bíblia|unreached|não alcançad|revival|avivamento|baptiz|batiz|first church|primeira igreja|new church|plantad/i;
const BOAS = /Morning Star|International Christian Concern|Mission Network|IMB|Portas Abertas|Open Doors|Christianity Today|Gospel Coalition|Ultimato|Coalizão|Release International|Barnabas|Mukhanyo|Seminary|Seminário|Presbiteriana|Christian Post|Christian Daily|Religion News|Baptist Press|Evangelical Focus|World Magazine|WORLD|Gospel Herald|Guiame|Comunhão|Lausanne/i;
/* =====================================================================
   VERIFICAÇÃO ANTI-FAKE NEWS (antes de publicar)
   1. Fonte confiável: feeds diretos escolhidos pelo SOLA ou veículos
      reconhecidos (lista abaixo).
   2. Sem fonte reconhecida: só entra se a mesma notícia aparecer em outra
      fonte independente (confirmação cruzada).
   3. Manchetes sensacionalistas ou caça-clique são descartadas.
   Toda notícia publicada leva o nome da fonte, o link e o selo da checagem.
   ===================================================================== */
const CONFIAVEIS = /Reuters|Associated Press|\bAP News\b|AFP|BBC|CNN|New York Times|Washington Post|Wall Street Journal|Guardian|Financial Times|Al Jazeera|Deutsche Welle|\bDW\b|France 24|Voice of America|\bVOA\b|NPR|PBS|Economist|Time\b|Newsweek|Folha|G1|\bg1\b|Globo|Estadão|Estadao|UOL|CNN Brasil|Gazeta do Povo|Veja|Poder360|Agência Brasil|BBC News Brasil|Christianity Today|Gospel Coalition|Christian Post|Christian Daily|Religion News|Baptist Press|WORLD|World Magazine|Premier Christian|Evangelical Focus|Catholic News Agency|Crux|Vatican News|Fides|Aid to the Church in Need|ACN|Open Doors|Portas Abertas|International Christian Concern|Morning Star News|Mission Network News|IMB|Release International|Barnabas|CSW|Christian Solidarity|Voice of the Martyrs|Lausanne|Ultimato|Coalizão pelo Evangelho|Guiame|Comunhão|Mukhanyo|Seminary|Seminário|Presbyterian|Presbiteriana|Ligonier|Desiring God|9Marks|Evangelical Alliance|World Evangelical Alliance|Wycliffe|SIL|Bible Society|Sociedade Bíblica/i;
const SENSACIONAL = /!!|\?\?|chocante|urgente|inacreditável|você não vai acreditar|não vai acreditar|bombástic|escândalo|shocking|you won'?t believe|must see|breaking!|exposed|the truth about|profecia|prophecy|end times|fim dos tempos|apocalipse (já|chegou)|illuminati|conspira/i;
const palavras = t => new Set(normT(t).split(" ").filter(w => w.length > 4));
function verificar(lista){
  const ok = [], fora = [];
  for (const x of lista) {
    if (SENSACIONAL.test(x.titulo) || (x.titulo.replace(/[^A-Z]/g, "").length > x.titulo.length * 0.6)) { fora.push(`sensacionalista: ${x.titulo}`); continue; }
    if (!x.gnews || CONFIAVEIS.test(x.fonte)) { x.verif = x.gnews ? "fonte reconhecida" : "fonte acompanhada pelo SOLA"; ok.push(x); continue; }
    const pw = palavras(x.titulo);
    const outras = lista.filter(y => y !== x && y.fonte !== x.fonte && [...palavras(y.titulo)].filter(w => pw.has(w)).length >= 3);
    if (outras.length) { x.verif = `confirmada também por ${outras[0].fonte}`; ok.push(x); }
    else fora.push(`sem confirmação (${x.fonte}): ${x.titulo}`);
  }
  return { ok, fora };
}
/* Relevância: só assuntos cristãos; fora anúncios de vagas, eventos internos, lojas e textos curtos demais */
const CRISTAO = /christ|crist|church|igreja|pastor|bible|bíblia|biblia|gospel|evangel|ministr|mission|missão|missões|missionár|believer|crente|faith|fé\b|seminar|theolog|teolog|reformed|reformad|presbyter|presbiter|baptist|batist|worship|culto|jesus|deus\b|god\b|scripture|escritura|persecut|persegu|pray|ora[çc]/i;
const LIXO = /\b(coordinator|coordenador|director of|diretor de|manager|gerente|assistant|assistente|on-site|presencial|full-time|part-time|apply|candidat|job|jobs|hiring|position|vacanc|intern|internship|estagi|vaga|vagas|pulpit supply|substituição no púlpito|bookstore|livraria|giving tuesday|donate|doação|webinar|register now|inscriç|admissions|commencement|gala|golf|calendar|podcast episode|episode \d+)/i;
const relevante = x => CRISTAO.test(x.titulo + " " + x.resumo) && !LIXO.test(x.titulo) && x.titulo.split(/\s+/).length >= 5;
const descartados = itens.filter(x => !relevante(x));
itens.splice(0, itens.length, ...itens.filter(relevante));
const chk = verificar(itens);
chk.fora.unshift(...descartados.slice(0, 8).map(x => `fora do tema/anúncio: ${x.titulo}`));
relatorio.push(`\nChecagem: ${chk.ok.length} aprovadas, ${chk.fora.length} descartadas`);
chk.fora.slice(0, 15).forEach(t => relatorio.push("  ✗ " + t));
itens.length = 0; itens.push(...chk.ok);

const brAgora = new Date(Date.now() - 3 * 3600e3), HOJE = brAgora.toISOString().slice(0, 10);
const nota = x => {
  let n = { per: 6, mis: 5, sem: 4, igr: 3 }[x.cat] || 0;
  if (PAISES.some(([pt]) => pt === x.pais)) n += 3;
  if (FORTE.test(x.titulo + " " + x.resumo)) n += 2;
  if (BOAS.test(x.fonte)) n += 2;
  const h = (Date.now() - Date.parse(x.data)) / 3600e3; n += h < 36 ? 3 : h < 72 ? 2 : h < 168 ? 1 : 0;
  if (x.resumo) n += 1;
  return n;
};
itens.forEach(x => x.nota = nota(x));
const melhor = (lista, evita) => lista.filter(x => !evita.some(y => y === x || (y.pais && y.pais === x.pais && y.cat === x.cat) || normT(y.titulo).slice(0, 40) === normT(x.titulo).slice(0, 40)))
  .sort((a, b) => b.nota - a.nota || b.data.localeCompare(a.data))[0];
const POR_TIPO = 5;
function escolherDia(){
  const sel = [];
  for (const c of ["per", "mis", "sem", "igr"]) {
    const doTipo = [];
    while (doTipo.length < POR_TIPO) {
      const x = melhor(itens.filter(y => y.cat === c), [...sel, ...doTipo]) ||
                itens.filter(y => y.cat === c && !doTipo.includes(y) && !sel.includes(y)).sort((a, b) => b.nota - a.nota)[0];
      if (!x) break; doTipo.push(x);
    }
    sel.push(...doTipo);
  }
  return sel;
}
const dias = (anterior.dias || []).filter(d => d.dia !== HOJE || !process.env.FORCAR);
let dHoje = dias.find(d => d.dia === HOJE);
if (!dHoje && (brAgora.getUTCHours() >= 6 || process.env.FORCAR || !dias.length)) {
  const picks = escolherDia();
  /* Tradução só das 5 escolhidas */
  let traduzidos = 0;
  for (const x of picks) {
    if (x.lang === "pt") continue;
    try {
      const sep = "\n\n§§§\n\n";
      const t = await traduzir(x.titulo + (x.resumo ? sep + x.resumo : ""));
      const [tt, rr] = t.split(/\s*§§§\s*/);
      x.orig = x.titulo; x.titulo = (tt || x.titulo).trim(); if (x.resumo) x.resumo = (rr || x.resumo).trim(); x.lang = "pt"; x.traduzido = true; traduzidos++;
    } catch (e) { relatorio.push(`  (tradução falhou: ${e.message})`); }
  }
  picks.forEach(x => { delete x.nota; delete x.gnews; });
  const per = picks.filter(x => x.cat === "per");
  const dest = per.find(x => PAISES.some(([pt]) => pt === x.pais)) || per[0] || picks[0];
  dHoje = { dia: HOJE, destaque: dest ? dest.id : null, itens: picks };
  dias.unshift(dHoje);
  relatorio.push(`\nSeleção de ${HOJE}: ${picks.length} matérias, 5 por tipo (${traduzidos} traduzidas)`);
  picks.forEach((x, k) => relatorio.push(`  ${k + 1}. [${x.cat}] ${x.titulo} — ${x.fonte}${x.pais ? " · " + x.pais : ""}`));
} else relatorio.push(`\nSeleção de hoje mantida (${dHoje ? dHoje.dia : "aguardando 6h"}).`);
dias.sort((a, b) => b.dia.localeCompare(a.dia));

console.log(relatorio.join("\n"));
if (!dias.length || !dias[0].itens.length) { console.log("Nenhuma notícia obtida; mantendo o arquivo anterior."); process.exit(0); }
const saida = { atualizado: new Date().toISOString(),
  categorias: { mis: "Missões", per: "Igreja perseguida", sem: "Seminários reformados", igr: "Igreja no mundo" },
  fontes: FONTES.map(f => f.nome), dias: dias.slice(0, 7) };
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(saida, null, 1));
