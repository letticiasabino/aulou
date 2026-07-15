# Database Rules

## Sprint de produção

- `feedback` está versionada na migration `20260711030000_feedback.sql`, com RLS de insert pelo próprio usuário.
- A migration foi aplicada no projeto Supabase remoto do Aulou, incluindo o hardening de produção.

## Sprint 12 - notificacoes

- Notificacoes sao isoladas por `user_id` e possuem RLS obrigatorio.
- `related_event_id` referencia eventos academicos e o acesso permanece restrito ao dono.

## Sprint 10 - flashcards

- Baralhos, cartões e revisões devem ter `user_id` e RLS.
- `flashcards.deck_id` deve apontar para um baralho do mesmo usuário.
- O histórico de revisão é append-only no primeiro ciclo.

## Sprint 9 - planos de estudo

- `study_plans` e `study_tasks` pertencem ao usuário por `user_id` e devem usar RLS.
- Tarefas devem referenciar eventos acadêmicos confirmados.
- A capacidade diária é configurada pelo usuário e não deve ser excedida silenciosamente.

## Sprint 7 - academic_events

- Eventos importados só podem ser inseridos depois da confirmação do usuário.
- `academic_events` deve possuir `user_id`, `review_status`, `source_file_id`, `confidence_score` e `dedupe_key`.
- RLS deve restringir leitura, criação, edição e remoção ao próprio usuário.

## Sprint 5 - arquivos

- `files.size_bytes` deve ser maior que zero e no máximo 10 MB.
- `files.content_type` só aceita PDF, PNG, JPEG, WEBP, DOCX, XLSX, CSV ou TXT.
- Cada upload cria um registro em `file_extractions` com `status = pending` e `provider = mock` até a engine de extração ser implementada.
- O fallback local mantém somente metadados; o conteúdo binário não é salvo em `localStorage`.

## Escopo da Sprint 4

O banco real do Aulou usa Supabase Postgres como backend alvo. O fallback local existe apenas para desenvolvimento sem env pública configurada.

## Convenções

- Toda tabela de dados do usuário deve ter `user_id uuid not null`.
- Toda tabela editável deve ter `created_at` e `updated_at`.
- Chaves primárias usam `uuid` com `gen_random_uuid()`.
- Campos de status usam `text` com `check` no primeiro ciclo para evitar enums rígidos cedo demais.
- Dados apagáveis pelo usuário devem preferir `deleted_at` quando houver histórico relevante; em tabelas acadêmicas simples, a exclusão física é aceita nesta sprint.
- Tabelas criadas por SQL bruto devem habilitar RLS explicitamente.
- Grants devem liberar acesso ao papel `authenticated` somente nas operações necessárias.
- O papel `anon` não recebe acesso direto às tabelas sensíveis.

## Tabelas iniciais aplicadas

- `profiles`
- `institutions`
- `courses`
- `semesters`
- `teachers`
- `subjects`
- `files`
- `file_extractions`
- `user_settings`
- `subscriptions`
- `usage_limits`
- `audit_logs`

## RLS

Todas as tabelas acima devem usar policies por dono:

- `select`: `to authenticated using ((select auth.uid()) = user_id)`
- `insert`: `to authenticated with check ((select auth.uid()) = user_id)`
- `update`: `to authenticated using (...) with check (...)`
- `delete`: `to authenticated using (...)`

## Storage

- Bucket inicial: `academic-files`.
- Bucket privado, nunca público.
- Caminho obrigatório: `<user_id>/<file_id>/<filename>`.
- Policies em `storage.objects` devem validar `bucket_id = 'academic-files'` e primeira pasta igual a `auth.uid()`.

## Migrations

## Validacao pos-Sprint 5 (2026-07-14)

- As migrations de jobs/notificacoes e `file_extractions` permanecem pendentes de aplicacao remota.
- O ambiente local nao confirmou o projeto `kcylfykwctjbgayajign`, nao possui CLI Supabase ou Docker e nao tinha credenciais de teste autorizadas.
- Nenhuma migration foi aplicada sem backup, listagem de historico remoto e confirmacao do alvo. Status: `BLOQUEADO POR ACESSO EXTERNO`.

## Validacao remota pos-Sprint 5 (2026-07-15)

- O projeto `kcylfykwctjbgayajign` foi confirmado e as migrations `20260714181441` e `20260714185103` foram aplicadas apos dry-run e comparacao de historico.
- `background_jobs`, `notifications` e `file_extractions` foram conferidas com RLS ativa, policies e funcoes remotas.
- Nao ha backup fisico listado e PITR esta desativado; migrations destrutivas exigem decisao e estrategia de recuperacao antes de aplicacao.
- `notification_deliveries` nao existe no schema nem nas migrations versionadas.

- Arquivos ficam em `supabase/migrations`.
- Não editar migration antiga após commit; criar nova migration incremental.
- Toda alteração de tabela sensível deve vir com RLS e grants no mesmo commit.
- Migration remota só deve ser aplicada quando `SUPABASE_PROJECT_REF`, CLI e credenciais estiverem configurados fora do Git.
