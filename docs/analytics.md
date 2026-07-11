# Analytics

## Sprint 14

- A taxonomia tipada cobre cadastro, onboarding, upload, IA, limites, upgrade e assinatura.
- Propriedades são sanitizadas antes do envio e eventos locais ficam limitados a 1.000 registros.
- `/analytics` mostra usuários únicos, conversão por etapa e eventos recentes.
- O adapter pode ser trocado por PostHog ou outro fornecedor sem alterar os fluxos do produto.

## Eventos obrigatórios

- `signup_started`
- `signup_completed`
- `onboarding_completed`
- `upload_started`
- `upload_completed`
- `events_extracted`
- `events_confirmed`
- `events_edited`
- `summary_generated`
- `flashcards_generated`
- `quiz_started`
- `study_plan_created`
- `limit_reached`
- `upgrade_clicked`
- `subscription_started`
- `subscription_completed`
- `subscription_cancelled`

## Propriedades padrão

- `user_id`
- `plan`
- `course_id`
- `semester_id`
- `subject_id`, quando aplicável
- `source`
- `file_type`
- `count`
- `limit_name`

## Cuidados

- Não enviar conteúdo integral de arquivo para analytics.
- Não enviar respostas completas da IA.
- Usar IDs e métricas agregadas.
