# Concordância Bíblica

App de estudo e busca bíblica (PWA): Bíblia completa em várias versões livres, leitura por livro e capítulo com comparação lado a lado, busca por palavra, expressão, raiz e referência, busca por foto, favoritos, histórico, notas e um painel de comentaristas, pensadores e conselheiros reformados.

**Abrir o app:** https://rafaelximenes2010-png.github.io/concordancia-biblica/
**iPhone:** abra no Safari → Compartilhar → Adicionar à Tela de Início. **Android:** Chrome → “Instalar app”.

## Versões incluídas (`/biblias`)
| Código | Versão | Licença |
|---|---|---|
| BLIVRE | Bíblia Livre — Copyright © Diego Santos, Mario Sérgio e Marco Teles | Creative Commons Atribuição (CC BY) Brasil |
| KJV | King James Version (1769) | Domínio público |
| ASV | American Standard Version (1901) | Domínio público |
| WLC | Westminster Leningrad Codex (hebraico, AT) | Domínio público |
| TR | Textus Receptus (grego, NT) | Domínio público |
| VULG | Vulgata Clementina (latim, sem deuterocanônicos) | Domínio público |

Textos obtidos de [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases) (MIT), que os reúne a partir de eBible.org/CrossWire.
Versões como ARA, ARC, NVI, NAA e NTLH têm direitos autorais e só podem ser incluídas com licença das detentoras (SBB, Biblica etc.).

## Como adicionar uma versão
Gere `biblias/CODIGO.json` no formato `{ code, name, lang, dir, license, books: { GEN: [[v1, v2, …], …] } }` e acrescente a entrada em `biblias/index.json`.
Ao publicar uma nova versão do app, altere `CACHE` em `sw.js`.
