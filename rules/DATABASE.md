# Database Rules

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
