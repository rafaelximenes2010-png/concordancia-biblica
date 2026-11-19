/* Grava traduções feitas à mão na memória de tradução (i18n/conteudo/<idioma>/_memoria.json),
   para que tools/traduzir-conteudo.mjs as use em vez da tradução automática.
   Uso: node tools/i18n-memoria.mjs <arquivo-de-origem.json> <traducao.json> <idioma>
   A tradução tem a mesma estrutura do original (só os campos de texto precisam estar presentes),
   ou é um dicionário { "texto em português": "tradução" } quando a opção --dic é usada. */
import fs from "fs"; import path from "path"; import crypto from "crypto";
const [src, tr, lang, modo] = process.argv.slice(2);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const arq = path.join(ROOT, "i18n", "conteudo", lang, "_memoria.json");
fs.mkdirSync(path.dirname(arq), { recursive: true });
const mem = fs.existsSync(arq) ? JSON.parse(fs.readFileSync(arq, "utf8")) : {};
const sha = s => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
let n = 0;
const put = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string" || !a.trim()) return;
  const pa = a.split(/\n{2,}/), pb = b.split(/\n{2,}/);
  const pares = pa.length === pb.length ? pa.map((x, i) => [x, pb[i]]) : [[a, b]];
  for (const [x, y] of pares) { const m = x.match(/^(#{1,4} |[-*] |\d+\. )?([\s\S]*)$/), my = y.match(/^(#{1,4} |[-*] |\d+\. )?([\s\S]*)$/); mem["pt>" + lang + ":" + sha(m[2])] = my[2]; n++; }
};
const T = JSON.parse(fs.readFileSync(tr, "utf8"));
if (modo === "--dic") for (const [a, b] of Object.entries(T)) put(a, b);
else {
  const S = JSON.parse(fs.readFileSync(src, "utf8"));
  (function par(s, t) {
    if (typeof s === "string") return put(s, t);
    if (Array.isArray(s) && Array.isArray(t)) s.forEach((x, i) => par(x, t[i]));
    else if (s && t && typeof s === "object" && typeof t === "object") for (const k of Object.keys(s)) if (k in t) par(s[k], t[k]);
  })(S, T);
}
fs.writeFileSync(arq, JSON.stringify(mem));
console.log(lang, src, "→", n, "trechos na memória");
