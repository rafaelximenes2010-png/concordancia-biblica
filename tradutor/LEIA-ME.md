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
