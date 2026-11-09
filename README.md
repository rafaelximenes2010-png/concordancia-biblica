# SOLA | Bíblia & Teologia

Aplicativo (PWA) de estudo bíblico para celular e computador.

**Abrir o app:** https://rafaelximenes2010-png.github.io/concordancia-biblica/
**iPhone:** abra no Safari → Compartilhar → Adicionar à Tela de Início. **Android:** Chrome → menu ⋮ → Instalar app.

## Abas
- **Início** — texto do dia, devocional, estudo sugerido, notas, leitura e sequência de dias de estudo.
- **Busca bíblica** — busca por palavra, expressão, raiz, referência ou foto; filtros, favoritos, histórico, comentários e pesquisa externa (Perplexity, Google, DuckDuckGo).
- **Texto do dia** — passagem diária (lista em `VOTD`), na tradução indicada.
- **Devocional** — série original de demonstração (`DEVOS`), com reflexão e aplicação.
- **Estudos BibleProject** — catálogo com links para a fonte oficial (`BP`). Não afiliado ao BibleProject.
- **Minhas notas** — anotações de cultos e estudos salvas no aparelho (`NotesStore`, preparado para sincronização via `SyncAdapter`).

## O que depende de integração futura
- Notificações push com o app fechado: preencher `PUSH_CONFIG` e implementar `subscribePush()` com um servidor.
- Sincronização de notas entre aparelhos: implementar `SyncAdapter` com conta e banco de dados.
- Versões bíblicas com direitos autorais (ARA, NVI etc.): exigem licença.

## Versões incluídas (`/biblias`)
| Código | Versão | Licença |
|---|---|---|
| BLIVRE | Bíblia Livre | Bíblia Livre (BLIVRE), Copyright © Diego Santos, Mario Sérgio e Marco Teles. Licença Creative Commons Atribuição (CC BY) Brasil. Baseada na tradução de João Ferreira de Almeida (1819). Reprodução permitida desde que mencionados fonte e autores. |
| BLIVRETR | Bíblia Livre — Textus Receptus | Bíblia Livre (BLIVRE-TR), Copyright © Diego Santos, Mario Sérgio e Marco Teles. Licença Creative Commons Atribuição (CC BY) Brasil. |
| BPM | Bíblia Portuguesa Mundial | Domínio público. Tradução para o português baseada na World English Bible (eBible.org). |
| BLT | Bíblia Livre Para Todos (NT) | Copyright © 2022 Free Bible Ministry, Inc. Licença Creative Commons Atribuição-CompartilhaIgual 4.0 (CC BY-SA). Fonte: eBible.org. |
| TFT | Tradução para Tradutores (NT, explicativa) | Tradução de Ellis W. Deibler Jr. Licença Creative Commons Atribuição-CompartilhaIgual 4.0 (CC BY-SA). Fonte: eBible.org. Traz explicações entre colchetes e alternativas entre chaves. |
| KJV | King James Version (1769) | Domínio público. |
| ASV | American Standard Version (1901) | Domínio público. |
| WLC | Westminster Leningrad Codex (hebraico, AT) | Domínio público. |
| TR | Textus Receptus (grego, NT, 1550/1894) | Domínio público. |
| VULG | Vulgata Clementina (latim) | Domínio público. Livros deuterocanônicos não incluídos neste app. |
| RV1909 | Reina-Valera 1909 (espanhol) | Domínio público. |
| MARTIN | Bible David Martin 1744 (francês) | Domínio público. |
| ELB1905 | Elberfelder 1905 (alemão) | Domínio público. |
| SV | Statenvertaling (holandês) | Domínio público. Livros apócrifos não incluídos neste app. |
| SYNOD | Tradução Sinodal (russo) | Domínio público. Livros deuterocanônicos não incluídos neste app. |
| CUV | 和合本 Chinese Union Version 1919 (chinês tradicional) | Domínio público. |
| VAMVAS | Neophytos Vamvas 1850 (grego moderno) | Domínio público. |
| KAROLI | Károli revisada 1908 (húngaro) | Domínio público. |
| GDANSKA | Biblia Gdańska 1881 (polonês) | Domínio público. |
| SWE1917 | Bíblia sueca de 1917 | Domínio público. Livros apócrifos não incluídos neste app. |

Versões com direitos autorais (ARA, ARC, NAA, NVI, NVT, NTLH, NBV, O Livro) não são incluídas: o app abre o mesmo capítulo no YouVersion ou na Bíblia Online (`EXT_PT` em index.html).

Textos obtidos de [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases) (MIT), que os reúne a partir de eBible.org/CrossWire.
Versões como ARA, ARC, NVI, NAA e NTLH têm direitos autorais e só podem ser incluídas com licença das detentoras (SBB, Biblica etc.).

## Como adicionar uma versão
Gere `biblias/CODIGO.json` no formato `{ code, name, lang, dir, license, books: { GEN: [[v1, v2, …], …] } }` e acrescente a entrada em `biblias/index.json`.
Ao publicar uma nova versão do app, altere `CACHE` em `sw.js`.

## Site, privacidade e termos

- Site: `site/index.html` → https://rafaelximenes2010-png.github.io/concordancia-biblica/site/
- Política de privacidade: `site/privacidade.html` · Termos de uso: `site/termos.html`

## Devocionais mensais

Cada mês tem um arquivo `devocionais/AAAA-MM.json` com um devocional por dia (`title`, `ref`, `art`, `theme`, `reflection`, `story`, `close`, `application`) e a paleta do mês. Sem o arquivo, o app usa a coleção básica.

## Pendências (deixadas para depois)

| Item | Situação | O que falta |
|---|---|---|
| **Voz masculina natural** (locutor Antônio, áudio no CarPlay/Bluetooth e com tela bloqueada) | Código pronto no app e em `tradutor/worker.js` | Criar conta Azure + recurso **Speech** (Free F0), colar a chave no Worker do Cloudflare e informar o endereço do Worker (`TR_PROXY`). Passo a passo em `tradutor/LEIA-ME.md`. |
| **App na App Store** (iPhone, inclusive tela no CarPlay) | Não iniciado | Conta Apple Developer (US$ 99/ano), Mac ou compilação na nuvem, empacotamento (política de privacidade e termos já prontos em `site/`) do app, telas e textos da loja. |
| Tradutor sem limite | Código pronto | Conta Azure (Translator F0) + Cloudflare; mesma ponte da voz. |
| Endereço próprio | Site pronto em `site/` | Registrar um domínio (ex.: `solabiblia.com.br` no Registro.br) e apontá-lo para o GitHub Pages. |
| Tradução revisada das confissões | Breve Catecismo e Heidelberg prontos | Catecismo Maior, Confissão de Westminster, Belga, Dort, Escocesa, Segunda Helvética e Batista de 1689 (hoje em tradução automática no app). |
| Devocionais de dezembro em diante | Novembro pronto; calendário em `devocionais/series.json` | Escrever `devocionais/2026-12.json` (“A Luz veio ao mundo”) e os meses seguintes. |
| Estatísticas de uso | Código pronto | Conta GoatCounter e o código do site. |
| Canal de sugestões | Usando GitHub | E-mail ou WhatsApp do SOLA. |
