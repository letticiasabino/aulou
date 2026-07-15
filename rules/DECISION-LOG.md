# Decision Log Rules

- Record irreversible architecture, security, hosting and provider decisions with date, reason and impact.
- Never record secrets, tokens or personal data.
- External blockers must be marked `BLOQUEADO POR ACESSO EXTERNO` with the exact next action.

## 2026-07-14 - Backend Sprint 5

### IMPLEMENTAÇÃO ANTECIPADA

- A fila duravel, o worker, locks, retries, backoff, notificacoes, Resend e o servico `aulou-worker` foram implementados antes da sprint em que seriam necessarios como plataforma geral.
- Esses componentes sao preservados porque sao validos, mas nao constituem a conclusao do escopo original da Backend Sprint 5, que e extracao documental.
- A correcao de escopo reutiliza a fila somente para executar `file_extraction`, com handler e dominio separados das notificacoes.

### Correcao de escopo

- A Sprint 5 passa a representar extracao documental. PDF usa PDF.js; DOCX usa Mammoth; XLSX usa JSZip e Fast XML Parser; CSV usa parser local com suporte a campos entre aspas; imagens sao classificadas como `ocr_required`.
- `NotificationJobHandler` e `FileExtractionJobHandler` sao registrados separadamente no worker. Nenhum OCR, OpenAI ou evento automatico foi adicionado.
- A migration incremental `20260714185103_backend_sprint5_file_extractions.sql` preserva migrations anteriores, amplia metricas/status, adiciona idempotencia e RPCs com ownership derivado de `auth.uid()`.
- Aplicacao e RLS/Storage reais estao `BLOQUEADOS POR ACESSO EXTERNO`: iniciar Docker/Supabase local ou fornecer projeto de teste, aplicar as migrations e executar o fluxo com duas contas dedicadas.

- Jobs de lembrete usam uma tabela Postgres duravel, claim atomico com `FOR UPDATE SKIP LOCKED`, lock temporario, retry exponencial e estado `dead`; Redis foi adiado ate existir concorrencia entre instancias ou carga que justifique outra infraestrutura.
- Eventos academicos confirmados enfileiram lembretes de forma idempotente. O worker persiste notificacoes in-app e envia e-mail apenas quando Resend e remetente estao configurados; ausencia do provedor e registrada como canal desativado, nunca como envio realizado.
- A funcao privilegiada de claim tem `search_path` vazio, EXECUTE revogado de `public`, `anon` e `authenticated`, e concedido somente a `service_role`. A tabela tem RLS e clientes autenticados possuem apenas SELECT das proprias linhas.
- Testes, typecheck, lint, formatacao e build passaram. Aplicacao da migration e smoke test real estao `BLOQUEADOS POR ACESSO EXTERNO`: iniciar Docker/Supabase local ou fornecer projeto de teste, aplicar `20260714181441_backend_sprint5_jobs_notifications.sql` e validar um evento com duas contas dedicadas; para e-mail, configurar `RESEND_API_KEY` e `EMAIL_FROM` de teste.

## 2026-07-12 - Backend Sprint 3

- O dominio academico foi implementado por migration incremental, preservando o schema legado.
- Semestres, disciplinas e eventos sao arquivados no DELETE; professores com vinculos nao podem ser excluidos.
- O backend usa o usuario derivado do JWT e o cliente Supabase vinculado ao bearer token; `user_id` nao e aceito no body.
- A migration e o RLS real ainda nao foram aplicados/testados no Supabase por falta de credenciais dedicadas.

## 2026-07-11 - Rebranding para Aulou

- Nome anterior: StudyPilot AI.
- Nome atual: Aulou.
- Motivo: consolidar a identidade brasileira e a marca oficial enviada.
- Impacto tecnico: pacote, metadata, PWA, textos visiveis, chaves de localStorage e testes foram atualizados; tabelas, colunas e migrations nao foram renomeadas.
- Identidade visual: laranja `#FF7A00`, azul-marinho `#14213D`, cinza claro `#F3F4F6` e branco `#FFFFFF`.
- Compatibilidade: dados persistidos no Supabase permanecem intactos; o fallback local passa a usar chaves Aulou para novas sessoes.

## 2026-07-11 - Hosting

- O app permanece um Next.js full-stack.
- Netlify e o destino preferencial do app web nesta fase.
- Supabase permanece como banco, Auth e Storage.
- Render fica preparado para um worker futuro; nenhum servico vazio foi publicado.
- O site Netlify `aulou` foi criado no plano existente; nenhum deploy foi declarado porque o upload nao concluiu.
- Status: deploy e conexao dos provedores estao `BLOQUEADOS POR ACESSO EXTERNO`.

## 2026-07-11 - Backend separado planejado

- Decisao: manter o Next.js como frontend e separar uma API Fastify no Render somente na Backend Sprint 1.
- Motivo: proteger secrets, centralizar autorizacao, enforcement de limites, IA e processamento assincrono sem sobrecarregar Route Handlers.
- Supabase continua responsavel por Auth, Postgres, Storage e RLS.
- Nenhum worker ou Redis sera criado nesta sprint; ambos dependem de jobs reais e carga observada.
- Compatibilidade: migrations, tabelas e contratos atuais do Supabase permanecem; a API sera uma nova fronteira, sem renomear dados persistidos.
- Artefatos: `backend/README.md`, `rules/BACKEND-ARCHITECTURE.md`, `rules/API-CONTRACTS.md`, `rules/ERROR-CATALOG.md`, `rules/BACKEND-SECURITY.md` e `rules/BACKEND-ROADMAP.md`.

## 2026-07-11 - Backend Sprint 1: fundacao da API

- Decisao: criar um pacote isolado `backend/` com Fastify, TypeScript, Zod, Pino, Swagger e Vitest.
- Escopo implementado: app, server, health, readiness, docs, CORS, erro global, env tipado, logger, placeholders de Auth e adapters de integracao.
- Nao implementado: dominio academico, upload, OCR, IA, jobs, Redis, migrations, autenticacao real e deploy.
- Render: blueprint `aulou-api` preparado com `autoDeploy: false`; nenhum servico publicado.
- Pendencia: `npm install` do backend nao concluiu por bloqueio de rede/cache no ambiente local; package-lock do backend sera gerado quando o registry estiver acessivel. Enquanto isso, Docker e Render usam `npm install`, nao `npm ci`.

## 2026-07-12 - Auth Supabase no backend

- Decisao: validar access tokens com `supabase.auth.getUser(token)` usando o cliente publico; nao criar login ou armazenamento de senha no backend.
- Identidade: `request.user.id` vem do token validado. Roles sao derivadas de `app_metadata.role`, com fallback `student`.
- Cliente admin: separado e disponivel apenas para usos futuros explicitamente privilegiados; nao e usado para Auth ou RLS.
- Rotas: `/v1/auth/me` e `/v1/auth/admin-check` documentadas no OpenAPI e cobertas por mocks.
- Limite: teste real com Supabase depende de credenciais dedicadas e nao foi executado nesta etapa.

## 2026-07-14 - Validacao de infraestrutura da Sprint 5

- Decisao: nao aplicar migrations nem criar usuarios de teste sem confirmar projeto remoto, organizacao, ambiente, historico e rollback.
- Evidencia local: `npm ci`, lint, typecheck, build e 41 testes passaram; o teste fora do sandbox resolveu uma restricao de permissao do esbuild no sandbox.
- Bloqueios: CLI Supabase, Docker, configuracao/credenciais do projeto remoto e CLI GitHub indisponiveis.
- Status: `BLOQUEADO POR ACESSO EXTERNO`. Nenhum OCR foi iniciado.

## 2026-07-15 - Desbloqueio remoto controlado da Sprint 5

- GitHub e Supabase foram autenticados; `main` foi publicada sem force e as duas migrations pendentes foram aplicadas no projeto confirmado.
- O projeto nao possui backup fisico listado nem PITR. As migrations foram nao destrutivas; mudancas destrutivas futuras exigem estrategia de recuperacao aprovada.
- Decisao: interromper o teste global do worker depois de confirmar que a fila ja contem jobs de terceiros. Um worker sem filtro de ambiente nao e seguro para validacao em projeto compartilhado.
- `notification_deliveries` nao foi encontrada no schema nem no codigo; nao foi criada por inferencia fora do escopo.
- Advisors: as duas RPCs de extracao foram mantidas como `SECURITY DEFINER` autenticadas porque precisam inserir jobs inacessiveis ao usuario direto. Ambas fazem verificacao de `auth.uid()` e ownership; `anon` permanece sem EXECUTE. A protecao global contra senhas vazadas do Supabase Auth continua pendente fora deste escopo.

## 2026-07-15 - Isolamento de ambientes da fila

- Decisao: cada job recebe `environment` e `queue_name`; o worker exige ambos por configuracao e faz claim atomico apenas para esse par. Nao existe fallback para `production`.
- Backfill conservador: fixtures historicos `sprint5-*@example.test` sao classificados como `test`; os demais jobs existentes sao preservados como `production`, sem reprocessamento.
- `notification_deliveries`: **adiado formalmente** para a sprint NotificationEngine. O beta atual registra o estado da notificacao e do job, mas ainda nao necessita auditoria por tentativa, provider ou reenvio.
- A protecao de senhas vazadas e uma **ACAO MANUAL OBRIGATORIA**: Supabase Dashboard > Authentication > Security > Password Security > Enable leaked password protection.
