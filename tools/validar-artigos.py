#!/usr/bin/env python3
"""Valida artigos/sola.json conforme artigos/REGRAS.md. Uso: python3 tools/validar-artigos.py"""
import json, re, sys, collections, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((root / "artigos/sola.json").read_text(encoding="utf-8"))
html = (root / "index.html").read_text(encoding="utf-8")
docs = {d["id"] for d in json.loads((root / "docs/index.json").read_text(encoding="utf-8"))}
erros, ids, obras = [], set(), collections.defaultdict(set)
for i, a in enumerate(data["items"]):
    tag = a.get("id", f"#{i}")
    for k in ("id", "t", "mes", "title", "author", "work", "min", "body", "links"):
        if k not in a: erros.append(f"{tag}: falta o campo {k}")
    if a.get("id") in ids: erros.append(f"{tag}: id repetido")
    ids.add(a.get("id"))
    if not re.fullmatch(r"[a-z0-9-]+", a.get("id", "")): erros.append(f"{tag}: id inválido")
    if not (0 <= a.get("t", -1) <= 15): erros.append(f"{tag}: tema fora de 0–15")
    if not re.fullmatch(r"20\d\d-(0[1-9]|1[0-2])", a.get("mes", "")): erros.append(f"{tag}: mes deve ser AAAA-MM")
    w = len(a.get("body", "").split())
    if not 240 <= w <= 420: erros.append(f"{tag}: {w} palavras (esperado 280–380)")
    if a.get("body", "").count("\n## ") < 2: erros.append(f"{tag}: poucas seções ##")
    key = (a.get("t"), a.get("work", "").split("(")[0].strip().lower())
    if key in obras["k"]: erros.append(f"{tag}: obra repetida no mesmo tema")
    obras["k"].add(key)
    for l in a.get("links", []):
        u = l.get("url", "")
        if u.startswith("bib:"):
            m = re.fullmatch(r"bib:([0-9A-Z]{3})\.(\d+)", u)
            if not m or f'"{m.group(1)}"' not in html: erros.append(f"{tag}: referência bíblica inválida {u}")
        elif u.startswith("doc:"):
            if u[4:] not in docs: erros.append(f"{tag}: documento inexistente {u}")
        elif not u.startswith("https://"): erros.append(f"{tag}: link inválido {u}")
por = collections.Counter((a["t"], a["mes"]) for a in data["items"])
print(f"{len(data['items'])} artigos · por mês: {dict(collections.Counter(a['mes'] for a in data['items']))}")
if erros:
    print("ERROS:"); [print(" -", e) for e in erros]; sys.exit(1)
print("OK")
