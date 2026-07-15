# Aulou Backend Roadmap

## Backend 0 - Auditoria e arquitetura

Conclui leitura do monolito Next.js, classificacao de responsabilidades, contratos, seguranca, jobs e deploy alvo. Nenhuma funcionalidade nova.

## Backend 1 - Fundacao

Criar workspace backend Fastify, Pino, Zod, OpenAPI, health/readiness, config tipada, erros, request ID, CORS e testes basicos.

## Backend 2 - Auth e dominio academico

Validar JWT Supabase, contexto de usuario e roles. Depois, criar repositories e CRUD de subjects, semesters, teachers e academic events com ownership.

## Backend 3 - Arquivos e importacao

Criar upload autenticado, metadados, jobs de importacao, preview, retry, idempotencia e integracao Storage.

## Backend 4 - IA e estudos

Mover AIContextEngine, resumos, tutor, flashcards, quizzes, PlanningEngine e RiskEngine para modulos server-side.

## Backend 5 - Extracao de documentos

Escopo original: extracao textual de PDF, deteccao de PDF provavelmente escaneado, DOCX, XLSX, CSV, classificacao de imagens como `ocr_required`, normalizacao, metricas, persistencia, consulta, idempotencia, retry, RLS, testes e Swagger. OCR real, OpenAI e criacao automatica de eventos permanecem fora do escopo.

Status apos correcao: concluido na base de codigo com adapters locais, limites de 10 MB, 1 milhao de caracteres, 500 paginas e 50 mil linhas, persistencia incremental, endpoints autenticados e job handler isolado. Pendente apenas aplicar migrations e executar smoke test em Supabase Storage autorizado.

Validacao de infraestrutura (2026-07-14): `BLOQUEADO POR ACESSO EXTERNO`. A validacao local passou com 41 testes, lint, typecheck e build; a confirmacao do Supabase remoto, Storage, RLS, jobs e push depende de CLIs autenticadas e ambiente de teste. Ver `rules/SPRINT-5-INFRASTRUCTURE-VALIDATION.md`.

### IMPLEMENTAÇÃO ANTECIPADA

Fila duravel no Postgres, claim atomico, locks, retry com backoff, dead-letter, worker de lembretes, notificacoes in-app, e-mail Resend e configuracao `aulou-worker` no Render foram entregues antecipadamente. O trabalho e preservado e reutilizado por meio de handlers isolados no job registry; ele nao substitui os criterios de conclusao da extracao documental.

## Backend 6 - Monetizacao e beta

Enforcement server-side de limites, webhooks de pagamento, analytics confiavel, observabilidade, testes de isolamento e deploy Render.

## Backend Sprint 3 - Dominio academico

Concluido na base de codigo: CRUD protegido, filtros, paginacao, relacao professor-disciplina, validacao Zod e migration incremental. Pendente: aplicar migration em ambiente Supabase autorizado e executar RLS real com dois usuarios.
