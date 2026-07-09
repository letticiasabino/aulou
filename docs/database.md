# Banco de Dados

## Convenções

- Chaves primárias `uuid`.
- `user_id uuid not null` em todo registro sensível.
- `created_at`, `updated_at` e `deleted_at` quando aplicável.
- RLS habilitado em tabelas expostas.
- Políticas usam `to authenticated` com predicado de dono: `(select auth.uid()) = user_id`.
- Não usar `user_metadata` para autorização.

## Entidades iniciais

- `profiles`: perfil do usuário, nome, universidade, timezone e plano atual.
- `courses`: curso do usuário.
- `semesters`: semestre acadêmico.
- `subjects`: disciplinas.
- `teachers`: professores vinculáveis a disciplinas.
- `files`: metadados de arquivos enviados.
- `file_extractions`: texto extraído, status, erro seguro e métricas.
- `academic_events`: provas, trabalhos, aulas, fóruns, leituras e prazos.
- `event_reminders`: lembretes por evento.
- `study_plans`: planos gerados.
- `study_tasks`: tarefas do plano.
- `study_sessions`: sessões de estudo realizadas.
- `flashcard_decks`: coleções por disciplina/material.
- `flashcards`: cartões.
- `flashcard_reviews`: histórico de revisão espaçada.
- `quizzes`: quizzes gerados.
- `quiz_questions`: perguntas e alternativas.
- `quiz_attempts`: tentativas e pontuação.
- `ai_conversations`: conversas com tutor.
- `ai_messages`: mensagens e referências.
- `notifications`: notificações internas.
- `subscriptions`: plano, status e provedor.
- `usage_limits`: consumo por período e recurso.
- `payments`: pagamentos e faturas.
- `achievements`: conquistas e marcos.
- `user_settings`: preferências.
- `audit_logs`: eventos de segurança e auditoria sem dados sensíveis.

## Campos críticos de academic_events

- `user_id`
- `subject_id`
- `source_file_id`
- `title`
- `description`
- `event_type`
- `starts_at`
- `ends_at`
- `is_all_day`
- `weight`
- `confidence_score`
- `confidence_label`
- `review_status`
- `priority`
- `dedupe_key`
- `confirmed_at`

## Sprint 2 - Domínio acadêmico

Tabelas alvo para a primeira camada persistente:

### profiles

- `id uuid primary key references auth.users(id) on delete cascade`
- `user_id uuid not null unique references auth.users(id) on delete cascade`
- `display_name text not null`
- `institution_name text not null`
- `course_name text not null`
- `current_semester integer not null check (current_semester between 1 and 12)`
- `academic_year integer not null`
- `timezone text not null default 'America/Sao_Paulo'`
- `onboarding_completed_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### courses

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `name text not null`
- `institution_name text not null`
- `degree text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### semesters

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `course_id uuid references courses(id) on delete set null`
- `label text not null`
- `number integer not null check (number between 1 and 12)`
- `starts_on date`
- `ends_on date`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### teachers

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `name text not null`
- `email text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### subjects

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `semester_id uuid references semesters(id) on delete set null`
- `teacher_id uuid references teachers(id) on delete set null`
- `name text not null`
- `code text`
- `weekly_hours integer check (weekly_hours between 1 and 40)`
- `difficulty integer not null default 3 check (difficulty between 1 and 5)`
- `color text not null default '#9b7cff'`
- `status text not null default 'active'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

RLS alvo: habilitar RLS em todas as tabelas e criar policies por tabela com `to authenticated`, `using ((select auth.uid()) = user_id)` e `with check ((select auth.uid()) = user_id)` para insert/update. Como o changelog do Supabase de 2026-04-28 indica que tabelas podem não ser expostas automaticamente à Data API, a migration futura também deve revisar grants explícitos para `authenticated` sem abrir acesso indevido ao `anon`.

Observação: a Sprint 2 não executa migration remota porque o Supabase CLI não está instalado neste ambiente e não há projeto remoto conectado. A implementação usa service local-first com contratos compatíveis com esse schema.
