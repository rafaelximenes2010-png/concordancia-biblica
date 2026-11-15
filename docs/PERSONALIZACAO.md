# Personalização do SOLA (“Para você”)

## Versão 1 (atual): regras, tudo no aparelho

Hoje o SOLA **não usa um modelo de machine learning**. As sugestões vêm de regras com pesos, calculadas no próprio celular (`Perso` em `index.html`). Nada é enviado a servidores.

**Sinais usados** (só referências bíblicas, nunca texto pessoal):

| Sinal | Onde fica | Peso |
|---|---|---|
| Capítulo lido | `readLog` (localStorage, últimos 300) | 1, com meia-vida de 14 dias |
| Grifo | `hl` (chave `LIVRO.cap.vers`) | 2, com meia-vida de 14 dias |
| Favorito | `favorites` | 3 |

**Nunca entram:** o conteúdo das anotações (`notesV2`), títulos de notas, buscas digitadas ou dados de contato.

**Como as sugestões são montadas**
1. *Próxima leitura:* o capítulo seguinte ao último lido.
2. *Passagens relacionadas:* cada livro recebe uma pontuação. Os temas de `PV_THEMES` (Graça, Fé, Paz e ansiedade, Perdão…) somam as pontuações dos livros que citam. As passagens-chave dos 2 temas mais fortes são sugeridas, menos as que foram lidas recentemente.
3. *Estudos para retomar:* vídeos do BibleProject (`BP`) dos 3 livros mais lidos. Se não houver, são usados os temas em comum.
4. *Iniciantes* (sem histórico) ou com a personalização desligada: aparece a escolha de temas com passagens-chave.

**Controle do usuário:** em Configurações › Leitura e aparência › “Sugestões personalizadas”, ou no próprio cartão. Quando a opção está desligada, o app para de gravar `readLog` e mostra só sugestões gerais. Há também o botão “Apagar histórico de leitura”.

## Como evoluir para um modelo de ML

1. **Manter a privacidade como regra:** treinar com eventos anônimos de referência (`livro.cap`, tipo de evento, horário), sempre com consentimento explícito (*opt-in*) e nunca com texto de notas.
2. **Embeddings de passagens:** gerar vetores para cada perícope a partir do texto bíblico e das referências cruzadas (por exemplo, Treasury of Scripture Knowledge, de domínio público). Assim, “passagens relacionadas” passa a ser uma busca por similaridade a partir do que o usuário leu.
3. **Modelo leve no aparelho:** fatoração de matriz ou um *two-tower* pequeno, exportado para TensorFlow.js/ONNX Web (menos de 2 MB). O treino é agregado no servidor com eventos opt-in, e a inferência roda no celular com o histórico local.
4. **Avaliar antes de trocar:** comparar com a v1 por meio de taxa de clique e leitura concluída, usando teste A/B. A v1 continua como alternativa (*fallback*) para iniciantes e para quem desligar a personalização.
