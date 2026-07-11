# Database Rules

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

O banco real do StudyPilot AI usa Supabase Postgres como backend alvo. A Sprint 4 versiona a primeira migration aplicável e mantém o fallback local apenas para desenvolvimento sem env pública configurada.

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

- Arquivos ficam em `supabase/migrations`.
- Não editar migration antiga após commit; criar nova migration incremental.
- Toda alteração de tabela sensível deve vir com RLS e grants no mesmo commit.
- Migration remota só deve ser aplicada quando `SUPABASE_PROJECT_REF`, CLI e credenciais estiverem configurados fora do Git.
