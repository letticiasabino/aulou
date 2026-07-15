# Aulou Backend

## Status

Este diretorio contem a API Fastify e o worker de notificacoes do Aulou. A Backend Sprint 5 adiciona jobs duraveis no Postgres, retry com backoff, lembretes idempotentes de eventos academicos, notificacoes in-app e e-mail real quando o Resend esta configurado.

A correcao de escopo da Sprint 5 adiciona extracao documental local de PDF, DOCX, XLSX e CSV, identifica PDF provavelmente escaneado e classifica imagens para OCR futuro. OCR, OpenAI e criacao automatica de eventos nao fazem parte desta entrega.

## Arquitetura alvo

- Netlify: frontend Next.js e experiencia web.
- Render: `aulou-api` como API Fastify e `aulou-worker` para jobs reais.
- Supabase: Auth, PostgreSQL, Storage privado e RLS.
- OpenAI: integracao server-side atras de adapter.

## Rotas atuais

- `GET /health`
- `GET /ready`
- `GET /v1/auth/me` com Bearer JWT Supabase
- `GET /v1/auth/admin-check` com role `admin`
- `GET /v1/notifications` com paginacao e filtro de nao lidas
- `PATCH /v1/notifications/:notificationId/read`
- `POST/GET /v1/file-extractions`
- `GET /v1/file-extractions/:id`
- `POST /v1/file-extractions/:id/retry`
- Swagger em `/docs` e `/docs/json`

## Fluxo de autenticacao

O frontend autentica no Supabase e envia `Authorization: Bearer <access_token>`. O backend valida o token com `auth.getUser`, deriva `request.user` e nunca aceita `user_id` ou role enviados pelo cliente. Roles confiaveis vem de `app_metadata.role`; o fallback e `student`.

## Desenvolvimento

```bash
npm install
npm run dev
npm run dev:worker
npm run typecheck
npm run lint
npm run test
npm run build
```

## Worker

Eventos confirmados criam um job idempotente no banco. O worker usa claim atomico com `FOR UPDATE SKIP LOCKED`, lock temporario, ate cinco tentativas e backoff exponencial. Sem `RESEND_API_KEY` e `EMAIL_FROM`, a notificacao in-app e processada normalmente e o e-mail fica explicitamente desativado.

Extracoes usam o mesmo transporte de jobs, mas handlers separados. O worker baixa o objeto do bucket privado, valida tamanho e assinatura, executa o adapter adequado e persiste texto normalizado, metricas, avisos e estado. Imagens nunca sao enviadas a terceiros: terminam como `ocr_required`.

Redis permanece fora do desenho atual: deve ser reavaliado apenas com mais de uma instancia, volume concorrente relevante ou requisitos de fila que o Postgres nao atenda.

## Validacao de infraestrutura

Em 2026-07-14, `npm ci`, lint, typecheck, build e os 41 testes locais passaram. A validacao contra Supabase real (migrations, Storage privado, RLS A/B, worker, retry e dead letter) esta `BLOQUEADO POR ACESSO EXTERNO` ate que haja CLI autenticada, confirmacao do projeto e contas dedicadas de teste. O registro completo esta em `../rules/SPRINT-5-INFRASTRUCTURE-VALIDATION.md`.

Em 2026-07-15, o projeto remoto foi confirmado e as migrations foram aplicadas. API, Storage privado e RLS A/B tiveram evidencia real. Nao executar o worker global novamente para testes enquanto a fila estiver compartilhada; o processamento completo de formatos, retry e dead letter requer ambiente isolado. Consulte `../rules/SPRINT-5-INFRASTRUCTURE-VALIDATION.md`.

O worker exige `WORKER_ENVIRONMENT` e `WORKER_QUEUES`; para smoke isolado use somente `test` e `file-extraction`. Sem chave de service role e JWT de usuario artificial em arquivo ignorado, nao inicie o fluxo remoto. O estado atual do roteiro esta em `../rules/ISOLATED-WORKER-SMOKE-TEST.md`.
