#!/usr/bin/env python3
"""Gera i18n/en.json e i18n/es.json a partir de i18n/src/*.tsv (pt<TAB>en<TAB>es)
   e dos nomes dos livros (CANON e BOOK_NAMES_I18N do index.html).
   Uso: python3 tools/i18n-build.py"""
import json, re, glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
pt_books = [m[1] for m in re.findall(r'\["([1-3]?[A-Z]{2,3})","([^"]+)","(?:AT|NT)"', src)]
pt_books = re.findall(r'\["[1-3]?[A-Z0-9]{2,3}","([^"]+)","(?:AT|NT)"', src)
names = {}
for lang in ("en", "es"):
    m = re.search(lang + r':"([^"]+)"', src[src.index("BOOK_NAMES_I18N"):])
    names[lang] = m.group(1).split("|")
assert len(pt_books) == 66 and len(names["en"]) == 66, (len(pt_books), len(names["en"]))
out = {"en": {"strings": {}, "patterns": []}, "es": {"strings": {}, "patterns": []}}
for f in sorted(glob.glob(os.path.join(ROOT, "i18n", "src", "*.tsv"))):
    for n, line in enumerate(open(f, encoding="utf-8"), 1):
        line = line.rstrip("\n")
        if not line.strip() or line.startswith("#"): continue
        parts = line.split("\t")
        if len(parts) < 3: raise SystemExit(f"{f}:{n}: esperado pt<TAB>en<TAB>es")
        if parts[0].startswith("re:"):
            for i, lang in ((1, "en"), (2, "es")): out[lang]["patterns"].append([parts[0][3:], parts[i]])
            continue
        k = re.sub(r"\s+", " ", parts[0].replace("\\n", "\n")).strip()
        for i, lang in ((1, "en"), (2, "es")):
            v = parts[i].strip().replace("\\n", "\n")
            if v and v != k: out[lang]["strings"][k] = v
# Livros: nome sozinho e referências ("Mateus 6:33", "Hebreus 4:15–16 · BLIVRE")
esc = lambda s: re.escape(s).replace("\\ ", " ")
for lang in ("en", "es"):
    for pt, tr in zip(pt_books, names[lang]):
        if pt != tr: out[lang]["strings"].setdefault(pt, tr)
    alt = "|".join(sorted((esc(b) for b in pt_books), key=len, reverse=True))
    out[lang]["patterns"].insert(0, [r"^(" + alt + r")(\s+\d.*)$", "$1$2"])
for lang in ("en", "es"):
    p = os.path.join(ROOT, "i18n", lang + ".json")
    json.dump(out[lang], open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(lang, len(out[lang]["strings"]), "textos,", len(out[lang]["patterns"]), "padrões")
