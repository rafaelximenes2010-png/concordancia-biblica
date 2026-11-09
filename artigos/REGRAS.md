# Artigos do SOLA: regra de abastecimento mensal

## Regra
- O app mostra **até 5 artigos por tema**: os 5 mais recentes pelo campo `mes` (AAAA-MM).
- Os mais antigos não são apagados. Ficam em **"Edições anteriores"**, para não perder o que já foi lido, ouvido ou compartilhado.
- **Todo mês entram 2 artigos novos por tema**, ou seja, 40 por mês para os 20 temas. Com isso, em 2 a 3 meses cada tema renova o destaque por completo.
- Os artigos de um mês são publicados até o dia 25 do mês anterior, com `mes` igual ao mês seguinte. O app só exibe artigos com `mes` menor ou igual ao mês atual, então eles aparecem sozinhos no dia 1º.

## Temas (campo `t`)
| t | tema | t | tema |
|---|---|---|---|
| 0 | Graça e salvação | 8 | Igreja e culto |
| 1 | Soberania de Deus | 9 | Batismo e Santa Ceia |
| 2 | Oração | 10 | Evangelismo e missões |
| 3 | Santificação | 11 | As Escrituras |
| 4 | Família e casamento | 12 | Trindade |
| 5 | Criação de filhos | 13 | Pessoa de Cristo |
| 6 | Ansiedade, medo e fé | 14 | Espírito Santo |
| 7 | Sofrimento e consolo | 15 | Últimas coisas |
| 16 | Homossexualidade e fé cristã | 17 | Sexualidade e sexo antes do casamento |
| 18 | Aborto e a santidade da vida | 19 | Conselhos para o casamento |
| 20 | Especial de Natal (só em dezembro) | | |

## Formato de cada item (em `artigos/sola.json` › `items`)
```json
{ "id": "autor-tema-curto", "t": 0, "mes": "2026-12",
  "title": "Título em português", "author": "Nome do autor",
  "work": "Obra de referência (título original, ano)",
  "min": 2, "body": "Parágrafo...\n\n## Subtítulo\n\nParágrafo...",
  "links": [ { "label": "Site ou busca", "url": "https://..." },
             { "label": "Romanos 8 na Bíblia do SOLA", "url": "bib:ROM.8" } ] }
```
- `id` deve ser único, em letras minúsculas e com hífens.
- `body` tem de 280 a 380 palavras: uma introdução, 3 ou 4 seções `## ` e um fechamento prático.
- `links`: um link externo (site oficial do autor ou ministério, CCEL só para obras em domínio público, ou uma busca do Google) e uma passagem bíblica `bib:LIVRO.CAP`, com os códigos usados no app (GEN, PSA, ROM, 1CO…). Para documentos do app, use `doc:heidelberg`, `doc:calcedonia` e similares.
- `min` = palavras ÷ 170, arredondado, no mínimo 2.

## Regras de conteúdo
1. **Português do Brasil**, tom pastoral, claro e caloroso.
2. **Textos originais do SOLA.** Nunca copiar nem traduzir artigos protegidos. Apresentar as ideias do autor com palavras próprias. Citações diretas só de obras em domínio público, com no máximo uma frase curta.
3. **Precisão.** Só citar obras, datas e fatos de que se tenha certeza. Na dúvida, falar do tema do autor sem citar um título.
4. **Variedade.** Não repetir no mesmo tema uma obra já usada. Alternar autores contemporâneos (Piper, Tripp, Packer, Keller, Sproul, DeYoung, Ferguson, Reeves, Ortlund, Horton, Augustus Nicodemus, Hernandes Dias Lopes, Franklin Ferreira e outros), clássicos em domínio público (Calvino, Lutero, Agostinho, puritanos, Spurgeon, Ryle, Edwards, Bavinck, Kuyper) e, com leitura reformada crítica, vozes fora da tradição, como Jordan Peterson e C. S. Lewis.
5. **Fidelidade confessional:** de acordo com os Padrões de Westminster, as Três Formas de Unidade e a Confissão Batista de 1689, respeitando as diferenças entre elas.
6. Validar antes de publicar: `python3 tools/validar-artigos.py`.

## Pronúncia na voz
Nomes estrangeiros são reescritos só no áudio pela lista `PRONUNCIA` em `index.html` (por exemplo, John Piper vira "Djón Páiper"). Ao incluir um autor novo com nome estrangeiro, acrescente a forma falada a essa lista.

## Temas sensíveis (16, 17 e 18)
Apresentar a ética sexual e a defesa da vida segundo a fé reformada histórica, com firmeza bíblica e compaixão pastoral. Nunca usar linguagem de desprezo ou de ódio. Sempre oferecer o evangelho, o perdão de Cristo e o cuidado da igreja a quem luta ou já passou por essas situações.

## Especial de Natal (tema 20)
- De 1º a 25 de dezembro, entra **um artigo por dia**. Cada item tem `t: 20`, `mes: "AAAA-12"` e `dia: "AAAA-12-DD"`.
- O app mostra só os dias que já chegaram, em destaque no topo dos Artigos ("dia N de 25"); os anteriores ficam em "Dias anteriores".
- Os 25 artigos são publicados de uma vez, até o fim de novembro; o app libera um por dia.
- Percurso sugerido do Advento: promessas do Antigo Testamento (Gn 3:15, Is 7, Is 9, Mq 5), Zacarias e Isabel, Maria, José, o nome Jesus e Emanuel, Belém, os pastores, os anjos, Simeão e Ana, os magos, Herodes e a fuga para o Egito, a encarnação (Jo 1, Fp 2, Hb 2), o Natal na história da igreja e na Reforma, hinos de Natal, o Natal e o sofrimento, o Natal e a família, o Natal e a segunda vinda, e, no dia 25, "Hoje vos nasceu o Salvador" (Lc 2:11).
- Autores: Lutero (sermões de Natal), Calvino, Spurgeon (sermões de Natal), Agostinho, Atanásio (*A Encarnação do Verbo*), Tim Keller (*Hidden Christmas*, 2016), John Piper (*Good News of Great Joy*, leituras de Advento), Sinclair Ferguson, R. C. Sproul, Nancy Guthrie, além de autores brasileiros. As mesmas regras de originalidade, precisão e pronúncia valem aqui.
