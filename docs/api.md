# API

## Estilo

Usar Server Actions e Route Handlers do Next.js. Toda entrada deve passar por schema Zod. Erros retornam mensagens seguras e códigos de domínio.

## Rotas/ações previstas

- `auth.signUp`
- `auth.signIn`
- `onboarding.complete`
- `profile.getAcademicContext`
- `profile.updateAcademicContext`
- `subjects.create`
- `subjects.list`
- `subjects.update`
- `subjects.delete`
- `teachers.create`
- `teachers.list`
- `files.createUpload`
- `files.confirmUpload`
- `imports.process`
- `imports.preview`
- `imports.confirmEvents`
- `events.list`
- `events.update`
- `studyPlans.generate`
- `materials.summarize`
- `flashcards.generate`
- `quizzes.generate`
- `subscriptions.startCheckout`
- `usage.getLimits`
- `analytics.track`

## Contratos iniciais

- Upload aceita tipo, tamanho, nome original e checksum.
- Preview de importação retorna eventos normalizados e status de confiança.
- Confirmação de eventos aceita somente eventos validados e editáveis.
- Chamada de IA retorna `extracted_information`, `inferences`, `recommendations` e referências.

## Erros de domínio

- `ACADEMIC_PROFILE_REQUIRED`
- `INVALID_SEMESTER`
- `SUBJECT_REQUIRED`
- `TEACHER_REQUIRED`
- `FILE_TOO_LARGE`
- `UNSUPPORTED_FILE_TYPE`
- `LOW_CONFIDENCE_EXTRACTION`
- `AMBIGUOUS_DATE`
- `DUPLICATE_EVENT`
- `PLAN_LIMIT_REACHED`
- `AI_SCHEMA_VALIDATION_FAILED`
- `USER_ACTION_REQUIRED`
