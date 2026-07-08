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
