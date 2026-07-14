# Backend Sprint 5 - Gap Analysis

## Escopo esperado

A Sprint Backend 5 original implementa extracao documental segura e deterministica: PDF textual, deteccao de PDF provavelmente escaneado, DOCX, XLSX, CSV, classificacao de imagens como `ocr_required`, normalizacao, metricas, persistencia em `file_extractions`, consulta, idempotencia, retry, RLS, testes e Swagger. OCR real, OpenAI e criacao automatica de eventos nao pertencem a esta sprint.

## Auditoria do estado encontrado

| Item                                | Classificacao inicial       | Evidencia                                                                                |
| ----------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| Modulo `file_extractions`           | PARCIAL                     | A tabela e tipos de frontend existem; nao havia modulo no backend.                       |
| Migration `file_extractions`        | CONCLUÍDO                   | `20260710000000_initial_backend.sql` cria tabela, indices, trigger e RLS.                |
| Extracao de PDF textual             | NÃO IMPLEMENTADO            | Nenhum adapter ou teste no backend.                                                      |
| Deteccao de PDF escaneado           | NÃO IMPLEMENTADO            | Nenhuma heuristica ou estado `ocr_required`.                                             |
| Extracao de DOCX                    | NÃO IMPLEMENTADO            | Nenhum adapter ou dependencia.                                                           |
| Extracao de XLSX                    | NÃO IMPLEMENTADO            | Nenhum adapter ou dependencia.                                                           |
| Extracao de CSV                     | NÃO IMPLEMENTADO            | Nenhum parser no backend.                                                                |
| Imagens como `ocr_required`         | NÃO IMPLEMENTADO            | Upload aceita imagens, mas nao as classifica para OCR.                                   |
| Normalizacao de texto               | NÃO IMPLEMENTADO            | Nenhum normalizador compartilhado.                                                       |
| Metricas de extracao                | NÃO IMPLEMENTADO            | Apenas `token_count` legado, sem metricas por formato.                                   |
| Endpoints de extracao               | NÃO IMPLEMENTADO            | Nenhuma rota `/v1/file-extractions`.                                                     |
| Idempotencia                        | PARCIAL                     | Frontend cria uma extracao por upload por convencao, sem chave idempotente no banco/API. |
| Retry de extracao                   | NÃO IMPLEMENTADO            | Nao havia endpoint nem job de retry.                                                     |
| RLS                                 | CONCLUÍDO                   | Politicas por `auth.uid()` e grants existem na migration inicial.                        |
| Testes dos adapters                 | NÃO IMPLEMENTADO            | Nenhum teste de PDF, DOCX, XLSX, CSV ou imagem.                                          |
| Swagger                             | NÃO IMPLEMENTADO            | Rotas de extracao ausentes do OpenAPI.                                                   |
| Fila, worker, notificacoes e Resend | IMPLEMENTADO FORA DO ESCOPO | Entrega antecipada da plataforma de jobs/notificacoes.                                   |

## Escopo entregue antes da correcao

Foram entregues fila Postgres duravel, claim atomico, locks, retries com backoff, estado terminal, worker de notificacoes, e-mail Resend idempotente, rotas de notificacoes, migration de jobs e configuracao do worker no Render. A implementacao e valida, mas nao conclui a extracao documental.

## Diferencas, riscos e impactos

- A UI podia registrar upload e uma extracao `mock`, mas nenhum arquivo era lido.
- Estados `pending` podiam permanecer indefinidamente sem consumidor.
- Nao havia forma segura de consultar resultado ou solicitar retry pela API.
- PDFs escaneados e imagens nao eram distinguidos de falhas de parser.
- Sem limites de texto/linhas/paginas, um documento malicioso poderia consumir memoria excessiva.
- A fila antecipada estava acoplada ao processador de notificacoes, dificultando novos tipos de job.
- A migration de jobs pode estar aplicada; por isso sera estendida somente por migration incremental.

## Itens antecipados preservados

- `background_jobs`, claim atomico, locks, retries, backoff e dead-letter por estado.
- `NotificationJobHandler`, notificacoes in-app e Resend.
- `aulou-worker` no Render.
- Migration `20260714181441_backend_sprint5_jobs_notifications.sql` sem alteracoes retroativas.

## Itens faltantes e plano de correcao

1. Criar migration incremental para metadados de extracao, chave idempotente e job `file_extraction`.
2. Implementar normalizador, limites e adapters isolados por formato.
3. Criar `FileExtractionJobHandler` e registry separado do `NotificationJobHandler`.
4. Implementar criacao, consulta e retry autenticados com ownership.
5. Documentar rotas no Swagger.
6. Cobrir formatos, corrupcao, limites, isolamento, idempotencia, jobs, falha e retry.
7. Executar lint, typecheck, testes, build e `git diff --check`.

## Estado alvo

A sprint so pode ser declarada concluida quando todos os adapters sem OCR, persistencia, endpoints, integracao com jobs, isolamento e testes estiverem verdes. Aplicacao da migration e smoke test com Storage/RLS reais permanecem evidencia externa separada.

## Estado apos a correcao

| Item                                              | Classificacao final                      |
| ------------------------------------------------- | ---------------------------------------- |
| Modulo e migration incremental `file_extractions` | CONCLUÍDO                                |
| PDF textual e PDF provavelmente escaneado         | CONCLUÍDO                                |
| DOCX, XLSX e CSV                                  | CONCLUÍDO                                |
| Imagens como `ocr_required`                       | CONCLUÍDO                                |
| Normalizacao, metricas, limites e erros seguros   | CONCLUÍDO                                |
| Endpoints, idempotencia e retry                   | CONCLUÍDO                                |
| RLS e ownership A/B                               | CONCLUÍDO na base; smoke real pendente   |
| Testes dos adapters, jobs e rotas                 | CONCLUÍDO                                |
| Swagger                                           | CONCLUÍDO                                |
| OCR real, OpenAI e eventos automaticos            | NÃO IMPLEMENTADO, conforme escopo        |
| Jobs e notificacoes antecipados                   | IMPLEMENTADO FORA DO ESCOPO e preservado |
