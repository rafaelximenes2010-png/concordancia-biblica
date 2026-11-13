# Ponte de tradução e voz natural (Microsoft + Cloudflare)

Traduz os comentários e textos do app com o Microsoft Translator (plano gratuito
F0, 2 milhões de caracteres por mês) e guarda cada tradução para sempre no
Cloudflare: o mesmo trecho nunca é traduzido duas vezes, para nenhum usuário.

## 1. Microsoft (Azure)
1. Crie a conta em https://azure.microsoft.com/free
2. No portal (https://portal.azure.com) procure **Translator** › **Criar**.
3. Grupo de recursos: novo, ex. `comentarios`. Região: **Brazil South**.
   Nome: ex. `tradutor-comentarios`. Tipo de preço: **Free F0**. Criar.
4. Abra o recurso › **Chaves e Ponto de Extremidade**: copie a **Chave 1** e a **Região**.

## 2. Cloudflare
1. Crie a conta em https://dash.cloudflare.com/sign-up
2. **Workers & Pages** › **Create** › **Create Worker** › nome `tradutor` › **Deploy**.
3. **Edit code**: apague tudo, cole o conteúdo de `worker.js` › **Deploy**.
4. **Settings › Variables and Secrets**:
   - `AZURE_KEY` (tipo *Secret*): a Chave 1 da Microsoft
   - `AZURE_REGION` (tipo *Text*): `brazilsouth`
5. **Storage & Databases › KV** › criar namespace `tr-cache`.
   No Worker: **Settings › Bindings › Add › KV namespace**, nome da variável `TR_CACHE`.
6. Copie o endereço do Worker (ex.: `https://tradutor.SEUNOME.workers.dev`).

## 3. Ligar no app
No `index.html`, `TR_PROXY` já aponta para `https://tradutor.rafael-ximenes-2010.workers.dev`.
e publique. A chave fica só no Cloudflare; o app nunca a vê.

## 4. Voz natural de locutor (devocional em áudio, CarPlay)
1. No portal do Azure, procure **Speech** (Serviços de Fala) › **Criar**. Região **Brazil South**, preço **Free F0**.
2. Em **Chaves e Ponto de Extremidade**, copie a **Chave 1**.
3. No Worker do Cloudflare (**Settings › Variables and Secrets**):
   - `SPEECH_KEY` (Secret): a chave do Speech
   - `SPEECH_REGION` (Text): `brazilsouth`
4. Cole de novo o `worker.js` atualizado e clique em **Deploy**.

A voz padrão é `pt-BR-AntonioNeural` (masculina). Cada devocional é gerado uma única vez e fica guardado no Cloudflare e no celular.

## 5. Notificações push (tela do celular, com o app fechado)
O mesmo Worker envia as notificações do SOLA: devocional no horário que cada pessoa
escolheu, aviso de versão nova (sozinho, ao publicar) e avisos especiais.

1. **Edit code**: cole o `worker.js` atualizado › **Deploy**.
2. **Settings › Triggers › Cron Triggers**: troque `0 8 * * *` por `0,15,30,45 * * * *`
   (a cada 15 minutos). O Telegram continua com uma postagem por dia, a partir das 5h.
3. O KV `TR_CACHE` precisa estar ligado (já está). As chaves de push (VAPID) são
   criadas sozinhas na primeira vez — não há nada para copiar.
4. Opcional: **Variables and Secrets** › `PUSH_ADMIN` (Secret) com uma senha para a
   página de avisos. Sem ela, a senha é a mesma do teste do Telegram (6 últimos
   caracteres do `TG_TOKEN`).

Enviar um aviso: https://solabiblia.net.br/site/enviar-aviso.html

Como funciona a versão nova: a cada 15 minutos o Worker lê o `sw.js` publicado; se o
`CACHE` mudou, lê `APP_VERSION` e o primeiro item do `CHANGELOG` no `index.html` e avisa
quem marcou “Novas versões”. Só avisa quando o número da versão muda.

Limite do plano gratuito: até 40 envios por rodada; o restante segue na fila e sai nas
rodadas seguintes (a cada 15 minutos).
