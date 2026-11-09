# Artigos do SOLA: regra de abastecimento mensal

## Regra
- O app mostra **até 5 artigos por tema**: os 5 mais recentes pelo campo `mes` (AAAA-MM).
- Os mais antigos não são apagados. Ficam em **"Edições anteriores"**, para não perder o que já foi lido, ouvido ou compartilhado.
- **Todo mês entram 2 artigos novos por tema**, ou seja, 32 por mês para os 16 temas. Com isso, em 2 a 3 meses cada tema renova o destaque por completo.
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
