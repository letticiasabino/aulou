# Aulou API Contracts

## Backend Sprint 3 - dominio academico

Rotas protegidas: `/v1/semesters`, `/v1/subjects`, `/v1/teachers`, `/v1/subjects/:subjectId/teachers` e `/v1/academic-events`. Listagens aceitam `page` (minimo 1) e `limit` (padrao 20, maximo 100), retornando `data` e `meta`. Filtros sao aplicados sempre dentro do `user_id` autenticado. O cliente nao pode enviar `user_id`.

Os contratos abaixo sao planejados para a primeira API Fastify. Nenhuma rota nova e implementada nesta sprint.

## Backend Sprint 5 - jobs e notificacoes

`GET /v1/notifications` lista apenas notificacoes ja agendadas para o usuario autenticado, com `page`, `limit` e `unreadOnly`. `PATCH /v1/notifications/:notificationId/read` marca uma notificacao propria como lida. A identidade continua vindo exclusivamente do JWT. Jobs sao internos e nao aceitam escrita do cliente.

## Backend Sprint 5 - extracao documental

- `POST /v1/file-extractions`: recebe `fileId`, aceita `Idempotency-Key` de 1 a 200 caracteres e retorna `202` com a extracao persistida.
- `GET /v1/file-extractions`: lista resultados do usuario com paginacao e filtros `fileId`/`status`, sem carregar `rawText` na listagem.
- `GET /v1/file-extractions/:id`: retorna resultado, texto normalizado, metricas e avisos somente ao proprietario.
- `POST /v1/file-extractions/:id/retry`: aceita apenas estados `failed` ou `ocr_required`, reinicia o mesmo job com tentativas zeradas e retorna `202`.

Estados: `pending`, `processing`, `completed`, `failed` e `ocr_required`. Imagens e PDFs provavelmente escaneados terminam em `ocr_required`; nenhum OCR e executado nesta sprint.

## Convencoes

- Prefixo: `/v1`.
- Auth: Bearer JWT Supabase, salvo `GET /health` e `GET /ready`.
- Corpos e query strings validados com Zod.
- IDs sao UUIDs.
- Mutacoes de criacao aceitam `Idempotency-Key`.
- Respostas de sucesso usam JSON; listagens retornam `{ data, meta }`.
- Erros seguem `rules/ERROR-CATALOG.md`.

## Rotas

| Metodo           | Rota                                     | Auth | Entrada                                 | Saida                       |
| ---------------- | ---------------------------------------- | ---- | --------------------------------------- | --------------------------- |
| GET              | `/health`                                | Nao  | Nenhuma                                 | status do processo          |
| GET              | `/ready`                                 | Nao  | Nenhuma                                 | dependencias essenciais     |
| GET/POST         | `/v1/subjects`                           | Sim  | filtros / nome, semestreId, professorId | lista / disciplina          |
| GET/PATCH/DELETE | `/v1/subjects/:id`                       | Sim  | UUID e campos editaveis                 | disciplina                  |
| GET/POST         | `/v1/academic-events`                    | Sim  | filtros / evento confirmado             | lista / evento              |
| GET/PATCH/DELETE | `/v1/academic-events/:id`                | Sim  | UUID e campos editaveis                 | evento                      |
| POST             | `/v1/files`                              | Sim  | multipart, MIME e limite                | fileId e status             |
| GET              | `/v1/files`                              | Sim  | filtros e paginacao                     | lista                       |
| GET/DELETE       | `/v1/files/:id`                          | Sim  | UUID                                    | metadados / 204             |
| POST             | `/v1/imports`                            | Sim  | fileId ou texto                         | importId e preview          |
| GET              | `/v1/imports/:id`                        | Sim  | UUID                                    | status e eventos candidatos |
| POST             | `/v1/imports/:id/confirm`                | Sim  | eventos revisados                       | eventos salvos              |
| POST             | `/v1/imports/:id/retry`                  | Sim  | UUID                                    | novo status                 |
| POST             | `/v1/ai/summaries`                       | Sim  | material ou fileId                      | resumo estruturado          |
| POST             | `/v1/ai/chat`                            | Sim  | pergunta e contexto                     | resposta estruturada        |
| POST             | `/v1/ai/flashcards`                      | Sim  | material e subjectId                    | deck e cards                |
| POST             | `/v1/ai/quizzes`                         | Sim  | material e dificuldade                  | quiz                        |
| GET              | `/v1/notifications`                      | Sim  | page, limit, unreadOnly                 | lista paginada              |
| PATCH            | `/v1/notifications/:notificationId/read` | Sim  | id da notificacao                       | notificacao atualizada      |
| POST             | `/v1/file-extractions`                   | Sim  | fileId + Idempotency-Key                | extracao pendente           |
| GET              | `/v1/file-extractions`                   | Sim  | filtros e paginacao                     | lista sem texto bruto       |
| GET              | `/v1/file-extractions/:id`               | Sim  | UUID                                    | resultado da extracao       |
| POST             | `/v1/file-extractions/:id/retry`         | Sim  | UUID                                    | extracao reiniciada         |

## Auth

| Metodo | Rota                   | Auth                      | Entrada | Saida                           |
| ------ | ---------------------- | ------------------------- | ------- | ------------------------------- |
| GET    | `/v1/auth/me`          | Bearer JWT                | Nenhuma | `{ data: { id, email, role } }` |
| GET    | `/v1/auth/admin-check` | Bearer JWT + role `admin` | Nenhuma | `{ data: { id, email, role } }` |

O `id` da resposta vem exclusivamente do token validado pelo Supabase. O cliente nao pode enviar `user_id` para escolher identidade.

## Limites iniciais

Uploads seguem o limite atual de 10 MB e MIME allowlist. IA recebe limites de tamanho por request e rate limit por usuario/plano. Listagens usam paginacao com limite maximo de 100. Jobs de importacao sao idempotentes por arquivo e checksum.

## Arquivos e jobs de extração

`POST /v1/files/upload-intents`, `POST /v1/files/upload-intents/:id/complete`, `GET /v1/files`, `GET /v1/files/:id`, `DELETE /v1/files/:id`, `POST /v1/files/:id/extractions`, `GET /v1/files/:id/extractions`, `GET /v1/file-extractions/:id` e `POST /v1/jobs/:id/cancel` exigem Bearer JWT e ownership. Upload usa intent e URL temporária para bucket privado; MIME permitido e limite são 10 MB. Criação e cancelamento são idempotentes. Exclusão conflita com extração ativa; `running`, `completed` e `dead` não são canceláveis. `dead` é terminal e `cancelled` permanece cancelado.

## Erros

401 para sessao ausente/expirada, 403 para ownership negado, 404 para recurso inexistente do usuario, 409 para conflito/duplicidade, 422 para validacao e 429 para limite. O servidor nao retorna stack trace.
