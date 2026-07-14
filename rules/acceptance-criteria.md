# Acceptance Criteria

## Backend Sprint 3

- CRUD protegido de semestres, disciplinas, professores e eventos.
- Paginacao e filtros com limite maximo.
- Vinculos professor-disciplina sem cruzamento de usuarios.
- Migration incremental com constraints, indices e RLS.
- Nenhum upload, IA, importacao ou worker nesta sprint.

## Backend Sprint 5 - Extracao documental

- PDF textual, PDF provavelmente escaneado, DOCX, XLSX, CSV e imagens possuem adapters/testes.
- Imagem ou PDF sem camada textual retorna `ocr_required`; OCR real nao e executado.
- Solicitacao, consulta e retry sao autenticados, idempotentes e isolados por usuario.
- Texto, metricas, avisos e estados sao persistidos em `file_extractions` por migration incremental.
- `NotificationJobHandler` e `FileExtractionJobHandler` permanecem separados no registry.
- Lint, typecheck, testes, build e `git diff --check` devem passar.

- A production sprint is complete only when the build, tests, deployment URL, health check and unresolved blockers are documented.
- No external account, migration or security control may be marked complete without evidence.
- Beta readiness requires Auth, private Storage, RLS isolation, Terms, Privacy, backup plan and smoke test.
