/* =====================================================================
   SOLA — idiomas (português, inglês, espanhol)
   ---------------------------------------------------------------------
   • Idioma: Configurações → Idioma (Automático · Português · English · Español).
     Automático segue o idioma do aparelho/navegador (navigator.languages),
     reconhecendo variações regionais (pt-BR, pt-PT, en-GB, es-MX…).
     Sem nenhum dos três nas preferências → português.
   • Traduções centralizadas em i18n/en.json e i18n/es.json:
       strings   → catálogo no estilo gettext: o texto em português é a chave
       patterns  → textos com partes variáveis (regex → substituição)
     Texto ausente no catálogo cai no original em português (fallback).
   • Aplicação: a interface é traduzida no próprio DOM (textos, placeholder,
     aria-label, title, alt) e acompanha tudo o que o app desenha depois
     (MutationObserver). Nada é recarregado: tela, anotações, marcações e
     progresso de leitura ficam como estão.
   • No código do app: _t("texto em português", {n:3}) e LOC() para datas.
   • Conteúdo do usuário e áreas marcadas com data-i18n-skip não são tocados.
   ===================================================================== */
(function () {
  "use strict";
  var SUP = ["pt", "en", "es"];
  var LOCALE_PADRAO = { pt: "pt-BR", en: "en-US", es: "es-ES" };
  var NOME = { pt: "Português", en: "English", es: "Español" };
  var VER = "1";
  var ATTRS = ["placeholder", "aria-label", "title", "alt", "data-label"];
  var PULAR = "script,style,textarea,code,pre,[contenteditable],[data-i18n-skip],.no-i18n";

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function preferencia() { var p = ls("sola.lang"); return p && (p === "auto" || SUP.indexOf(p) >= 0) ? p : "auto"; }
  function doAparelho() {
    var lista = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || navigator.userLanguage || "pt-BR"];
    for (var i = 0; i < lista.length; i++) {
      var tag = String(lista[i] || ""), base = tag.toLowerCase().split(/[-_]/)[0];
      if (SUP.indexOf(base) >= 0) return { lang: base, locale: tag.replace("_", "-") || LOCALE_PADRAO[base] };
    }
    return { lang: "pt", locale: "pt-BR" };
  }
  function resolver() {
    var p = preferencia(), d = doAparelho();
    if (p === "auto") return { lang: d.lang, locale: d.locale, auto: true, aparelho: d };
    return { lang: p, locale: d.lang === p ? d.locale : LOCALE_PADRAO[p], auto: false, aparelho: d };
  }

  var I = { sup: SUP, nome: NOME, dict: null, pats: [], gen: 0, txt: new WeakMap(), att: new WeakMap() };
  function aplicarResolucao() { var r = resolver(); I.lang = r.lang; I.locale = r.locale; I.auto = r.auto; I.aparelho = r.aparelho; I.pref = preferencia(); }
  aplicarResolucao();
  window.SOLA_I18N = I;

  function compilar(j) {
    I.dict = j && j.strings ? j.strings : {};
    I.pats = (j && j.patterns ? j.patterns : []).map(function (p) { try { return [new RegExp(p[0]), p[1]]; } catch (e) { return null; } }).filter(Boolean);
  }
  /* Tradução de um trecho já normalizado: catálogo → padrões → rótulos "A · B" */
  function nucleo(k, prof) {
    var v = I.dict[k]; if (v != null) return v;
    if (prof > 3) return null;
    for (var i = 0; i < I.pats.length; i++) {
      var p = I.pats[i]; p[0].lastIndex = 0;
      if (p[0].test(k)) {
        var r = k.replace(p[0], function () { var a = arguments; return p[1].replace(/\$(\d)/g, function (m, n) { var g = a[+n]; if (g == null) return ""; var t = nucleo(g, prof + 1); return t == null ? g : t; }); });
        if (r !== k) return r;
      }
    }
    if (k.indexOf(" · ") > 0 || /^· | ·$/.test(k)) {        // rótulos compostos: "Juízes · Queda, Reino"
      var partes = k.split(/( ?· ?)/), mudou = false;
      for (var j = 0; j < partes.length; j += 2) {
        var s0 = partes[j].trim(); if (!s0) continue;
        var t0 = nucleo(s0, prof + 1);
        if (t0 == null && s0.indexOf(", ") > 0) {              // listas curtas de temas: só se todos traduzirem
          var itens = s0.split(", "), ok = true, saida = [];
          for (var q = 0; q < itens.length; q++) { var ti = I.dict[itens[q]]; if (ti == null) { ok = false; break; } saida.push(ti); }
          if (ok) t0 = saida.join(", ");
        }
        if (t0 != null && t0 !== s0) { partes[j] = partes[j].replace(s0, t0); mudou = true; }
      }
      if (mudou) return partes.join("");
    }
    return null;
  }
  /* Tradução de um texto em português (ou null se não houver) */
  function traduz(s) {
    if (I.lang === "pt" || !I.dict || s == null) return null;
    var k = String(s).replace(/\s+/g, " ").trim(); if (!k) return null;
    var v = nucleo(k, 0);
    if (v == null) return null;
    var ini = String(s).match(/^\s*/)[0], fim = String(s).match(/\s*$/)[0];
    return ini + v + fim;
  }
  /* Para o código do app: _t("Texto", {n: 2}) */
  I.t = function (s, vars) {
    var r = traduz(s); if (r == null) r = s;
    if (vars) r = String(r).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return r;
  };
  window._t = I.t;
  window.LOC = function () { return I.locale; };

  function pula(el) { return !el || (el.closest && el.closest(PULAR)); }
  function texto(n) {
    var el = n.parentElement; if (pula(el)) return;
    var cur = n.nodeValue, o = I.txt.get(n);
    if (o && o.gen === I.gen && cur === o.tr) return;          // já está no idioma atual
    if (!o || cur !== o.tr) o = { pt: cur };                    // o app escreveu um texto novo
    var v = traduz(o.pt); o.tr = v == null ? o.pt : v; o.gen = I.gen; I.txt.set(n, o);
    if (cur !== o.tr) n.nodeValue = o.tr;
  }
  function atributos(el) {
    if (pula(el)) return;
    var m = I.att.get(el); if (!m) { m = {}; I.att.set(el, m); }
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i]; if (!el.hasAttribute(a)) continue;
      var cur = el.getAttribute(a), o = m[a];
      if (o && o.gen === I.gen && cur === o.tr) continue;
      if (!o || cur !== o.tr) o = { pt: cur };
      var v = traduz(o.pt); o.tr = v == null ? o.pt : v; o.gen = I.gen; m[a] = o;
      if (cur !== o.tr) el.setAttribute(a, o.tr);
    }
    if (el.tagName === "INPUT" && /^(button|submit|reset)$/i.test(el.type) && el.value) {
      var ov = m.value; if (!(ov && ov.gen === I.gen && el.value === ov.tr)) { if (!ov || el.value !== ov.tr) ov = { pt: el.value }; var tv = traduz(ov.pt); ov.tr = tv == null ? ov.pt : tv; ov.gen = I.gen; m.value = ov; if (el.value !== ov.tr) el.value = ov.tr; }
    }
  }
  function percorrer(raiz) {
    if (!raiz) return;
    if (raiz.nodeType === 3) { texto(raiz); return; }
    if (raiz.nodeType !== 1 && raiz.nodeType !== 9 && raiz.nodeType !== 11) return;
    if (raiz.nodeType === 1) { if (pula(raiz)) return; atributos(raiz); }
    var w = document.createTreeWalker(raiz, 5 /* ELEMENT | TEXT */, {
      acceptNode: function (n) { if (n.nodeType === 1) return n.matches(PULAR) ? 2 /* REJECT */ : 1; return 1; }
    });
    var n; while ((n = w.nextNode())) { if (n.nodeType === 3) texto(n); else atributos(n); }
  }
  var fila = [], agendado = false;
  function processarFila() { agendado = false; var f = fila; fila = []; for (var i = 0; i < f.length; i++) percorrer(f[i]); }
  var obs = new MutationObserver(function (ms) {
    if (I.lang === "pt" && I.gen === 0) return;
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (m.type === "childList") { for (var j = 0; j < m.addedNodes.length; j++) fila.push(m.addedNodes[j]); }
      else if (m.type === "characterData") fila.push(m.target);
      else if (m.type === "attributes") { if (m.target.nodeType === 1 && !pula(m.target)) atributos(m.target); }
    }
    if (!agendado && fila.length) { agendado = true; processarFila(); }
  });

  function aplicarTudo() {
    I.gen++;
    document.documentElement.lang = I.locale;
    percorrer(document.documentElement);
    var tt = document.querySelector("title"); if (tt) percorrer(tt);
  }
  function carregar(lang) {
    if (lang === "pt") { compilar(null); return Promise.resolve(); }
    var chave = "sola.i18n." + lang;
    var cache = ls(chave);
    if (cache) { try { var c = JSON.parse(cache); if (c && c.strings) compilar(c); } catch (e) {} }
    var url = (document.currentScript && document.currentScript.src ? "" : "") + "i18n/" + lang + ".json?v=" + VER + "-" + (ls("sola.i18n.rev") || "0");
    return fetch(url, { cache: "no-cache" }).then(function (r) { return r.ok ? r.text() : null; }).then(function (t) {
      if (!t) return; try { var j = JSON.parse(t); compilar(j); ls(chave, t); } catch (e) {}
    }).catch(function () {});
  }

  /* Troca de idioma em tempo real: "auto" | "pt" | "en" | "es" */
  I.definir = function (pref) {
    var antes = I.lang;
    if (pref === "auto") ls("sola.lang", "auto"); else if (SUP.indexOf(pref) >= 0) ls("sola.lang", pref);
    aplicarResolucao();
    return carregar(I.lang).then(function () {
      aplicarTudo();
      try { document.dispatchEvent(new CustomEvent("sola:idioma", { detail: { lang: I.lang, antes: antes, locale: I.locale, auto: I.auto } })); } catch (e) {}
    });
  };
  /* Nome do idioma para pedir respostas da IA */
  I.nomeParaIA = function () { return { pt: "português do Brasil", en: "English", es: "español" }[I.lang]; };

  /* Conteúdos traduzidos: em inglês/espanhol, os arquivos de conteúdo vêm de i18n/conteudo/<idioma>/…
     (gerados por tools/traduzir-conteudo.mjs). Se a cópia ainda não existir, usa o original. */
  var CONTEUDO = /^(devocionais\/(\d{4}-\d{2}|series)\.json|artigos\/sola\.json|mapas\/(base|dados)\.json|docs\/[a-z0-9-]+\.json|salterio\/[a-z0-9-]+\.json|noticias\/feed\.json|ouvir\/spotify\.json)$/;
  var fetch0 = window.fetch ? window.fetch.bind(window) : null;
  if (fetch0) window.fetch = function (entrada, init) {
    try {
      if (I.lang !== "pt" && typeof entrada === "string") {
        var u = new URL(entrada, location.href), base = new URL(".", location.href);
        if (u.origin === base.origin && u.pathname.indexOf(base.pathname) === 0) {
          var rel = u.pathname.slice(base.pathname.length);
          if (CONTEUDO.test(rel)) {
            var alt = "i18n/conteudo/" + I.lang + "/" + rel + u.search;
            return fetch0(alt, init).then(function (r) { return r.ok ? r : fetch0(entrada, init); }, function () { return fetch0(entrada, init); });
          }
        }
      }
    } catch (e) {}
    return fetch0(entrada, init);
  };

  /* Aplica já na abertura: com o catálogo guardado no aparelho, a primeira pintura sai no idioma certo */
  if (I.lang !== "pt") {
    try { var c0 = ls("sola.i18n." + I.lang); if (c0) compilar(JSON.parse(c0)); } catch (e) {}
  }
  function iniciar() {
    obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat(["value"]) });
    if (I.lang !== "pt" && I.dict) aplicarTudo();
    carregar(I.lang).then(function () { if (I.lang !== "pt") aplicarTudo(); document.documentElement.lang = I.locale;
      try { document.dispatchEvent(new CustomEvent("sola:idioma", { detail: { lang: I.lang, antes: "pt", locale: I.locale, auto: I.auto, inicio: true } })); } catch (e) {} });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
  /* Modo automático: acompanha a troca de idioma do sistema */
  window.addEventListener("languagechange", function () { if (preferencia() === "auto") I.definir("auto"); });
})();
