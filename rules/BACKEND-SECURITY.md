# Aulou Backend Security

- Validar JWT Supabase no backend e derivar `userId` apenas do claim `sub`.
- Usar `auth.getUser(accessToken)` no cliente publico para validar o token.
- Derivar role somente de `app_metadata`; `user_metadata` nao autoriza acesso.
- Retornar 401 para autenticacao ausente/invalida e 403 para usuario sem permissao.
- Usar CORS allowlist com o dominio Netlify e origens locais explicitas.
- Aplicar headers, rate limit por IP e usuario, timeout e body limit.
- Validar todos os corpos, params, query strings e multipart com Zod.
- Aceitar somente MIME/extensoes permitidos; limite inicial de arquivo: 10 MB.
- Manter bucket Supabase privado e usar signed URLs curtas.
- Manter RLS; service role somente em processos server-side com necessidade documentada.
- O cliente admin esta isolado em `integrations/supabase/admin-client.ts` e nao e usado pelo middleware de Auth.
- Usar idempotency key em uploads, confirmacao de import e jobs futuros.
- Mascarar Authorization, cookies, API keys, dados de arquivo e prompts nos logs.
- Nao persistir senha no backend; Supabase Auth continua responsavel por credenciais.
- Implementar exclusao de conta e retencao de dados conforme LGPD antes do beta comercial.
- Testar isolamento com dois usuarios antes de declarar producao pronta.

## Secrets

`OPENAI_API_KEY`, service role, webhooks, Resend, Stripe e Redis sao server-only. O frontend recebe somente valores `NEXT_PUBLIC_*` publicos.

## Autenticacao

O frontend envia `Authorization: Bearer <access_token>`. O backend preenche `request.user` apos validacao. Rotas protegidas nunca aceitam identidade ou role vindas do body.

## Readiness

`/health` verifica apenas processo. `/ready` podera verificar configuracoes essenciais e conectividade leve, sem executar queries pesadas nem expor detalhes.

## Dominio academico

Rotas do dominio usam JWT Supabase, contexto autenticado e filtros por `user_id`. Relacoes N:N e eventos tambem sao protegidos por FKs compostas e RLS. O backend nao aceita `user_id` no payload.

## Extracao documental

- Limite de arquivo: 10 MB; texto normalizado: 1 milhao de caracteres; PDF: 500 paginas; planilhas: 100 abas, 50 mil linhas e 500 colunas.
- MIME vem do registro validado e cada adapter confere assinatura quando o formato possui magic bytes.
- O worker baixa objetos somente pelo cliente admin server-side e filtra extracao/arquivo pelo `user_id` do job.
- `raw_text` e sensivel, nunca entra em logs nem na listagem; apenas o endpoint de detalhe do proprietario o retorna.
- Erros inesperados viram mensagem segura. Detalhes tecnicos ficam somente nos logs protegidos do worker.
- RPCs privilegiadas validam `auth.uid()`, ownership e chave idempotente; EXECUTE e revogado de `public` e `anon`.
- Imagens e PDFs provavelmente escaneados terminam como `ocr_required`; nenhum dado e enviado a OCR ou IA.
