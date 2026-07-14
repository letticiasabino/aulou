# Aulou Backend Architecture

## Auditoria atual

O produto atual e um Next.js 16.2.10 com App Router e TypeScript. A API server-side existente esta em `src/app/api/ai/summary/route.ts`, `src/app/api/ai/tutor/route.ts` e `src/app/api/health/route.ts`. O callback de Auth esta em `src/app/auth/callback/route.ts`. O middleware/proxy de sessao esta em `proxy.ts` e `src/lib/supabase/proxy.ts`.

Servicos que hoje misturam dominio, fallback local e adaptadores Supabase ficam em `src/services`. Engines deterministicas ficam em `src/engines`. Nao existe backend Fastify separado nem worker persistente.

## Responsabilidades

| Area                                                 | Destino                    | Decisao                                                |
| ---------------------------------------------------- | -------------------------- | ------------------------------------------------------ |
| Sessao e login                                       | Supabase + frontend        | Supabase Auth continua provedor; API valida JWT        |
| Autorizacao                                          | Backend + Supabase         | Backend aplica ownership e RLS permanece defesa final  |
| Perfil, cursos, semestres, disciplinas e professores | Backend + Supabase         | API passa a ser fronteira de dominio                   |
| Agenda e eventos                                     | Backend + Supabase         | CalendarEngine sai do componente e vira modulo/engine  |
| Upload e metadados                                   | Backend + Storage Supabase | API valida e cria intencao; Storage continua privado   |
| OCR e extracao pesada                                | Worker Render              | Processamento assincrono, quando houver provider real  |
| Importacao de cronograma                             | Backend + worker           | ImportEngine estruturada; preview continua obrigatorio |
| IA, resumos, flashcards e quizzes                    | Backend + OpenAI           | Chave nunca chega ao frontend                          |
| Plano de estudos e risco                             | Backend                    | Engines deterministicas e persistencia Supabase        |
| Notificacoes e e-mail                                | Backend/worker             | Jobs futuros, sem Redis nesta sprint                   |
| Analytics                                            | Frontend + backend adapter | Eventos sem dados sensiveis                            |
| Feedback                                             | Backend + Supabase         | Insercao autenticada e isolada                         |
| Assinaturas e limites                                | Backend                    | Webhook e enforcement server-side                      |
| Health/readiness                                     | API Render e frontend      | Checks leves, sem secrets                              |

## Fluxo de autenticacao

O frontend envia o access token Supabase como Bearer. O backend valida assinatura, issuer, audience, expiracao e subject. O `userId` nasce do JWT; payloads do cliente nunca substituem esse valor. Repositories recebem o contexto autenticado e filtram por ownership. Supabase RLS continua ativo.

## Comunicacao e confiabilidade

Frontend chama `/v1` no Render com CORS restrito ao dominio Netlify. Requests recebem `requestId`, timeout de provider, retry somente para operacoes idempotentes e respostas de erro padronizadas. Jobs pesados retornam `jobId` e sao consultados por status.

## Server-side atual

Atualmente as Route Handlers Next.js sao a fronteira server-side. `server-ai.service.ts` monta contexto autenticado e usa OpenAI ou mock. `src/lib/supabase/server.ts` usa cookies SSR. Nao ha Server Actions declaradas.
