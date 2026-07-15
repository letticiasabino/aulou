# Smoke test isolado de jobs

Data: 2026-07-15. Escopo autorizado: somente `environment=test` e `queue_name=file-extraction`.

## Precondicoes verificadas

- `main` aponta para o repositorio oficial e contem `a0fa484` publicado.
- A migration `20260715221023_job_environment_isolation.sql` esta aplicada.
- Antes do smoke havia 24 jobs remotos, todos `production/file-extraction` (14 `completed`, 10 `dead`). Eles nao foram reivindicados, alterados ou reprocessados.
- Nao existem credenciais locais para API/worker: `.env`, `backend/.env` e `backend/.env.local` estao ausentes. A autenticacao administrativa da CLI nao concede chave de servico ou JWT de usuario para upload e processamento reais.

## Guard rails locais

- Ausencia de `WORKER_ENVIRONMENT`: worker encerra antes de conectar.
- Ausencia de `WORKER_QUEUES`: worker encerra antes de conectar.
- Ambiente invalido: configuracao Zod rejeitada.
- `NODE_ENV=test` com `WORKER_ENVIRONMENT=production`: worker recusado.

## Resultado remoto

**BLOQUEADO POR ACESSO EXTERNO.** Nao foram criados usuarios, objetos, arquivos, extracoes ou jobs de teste. Consequentemente, PDF textual/escaneado, DOCX, XLSX, CSV, imagem, retry, dead letter e cancelamento nao foram executados. Essa decisao evita iniciar API ou worker sem credenciais e evita qualquer risco aos jobs de producao.

Para desbloquear, fornecer em arquivo ignorado uma URL Supabase, chave publishable/anon, chave de service role e credenciais/JWT de uma conta artificial exclusiva. Em seguida, criar os oito fixtures, confirmar no banco que todos sao `test/file-extraction`, executar API e worker com `WORKER_ENVIRONMENT=test` e `WORKER_QUEUES=file-extraction`, registrar os resultados e limpar objetos, metadados, extracoes, jobs e usuario artificial.

## Advisors

- Seguranca: `auth_leaked_password_protection` permanece `WARN`/desabilitada. **ACAO MANUAL PENDENTE**: Dashboard Supabase > Authentication > Security > Password Security > Enable leaked password protection.
- Performance: indice `background_jobs_environment_claim_idx` aparece como nao usado porque o smoke isolado ainda nao executou. Os demais avisos observados sao preexistentes em `subject_teachers` e outros indices; nao foram alterados.

Nenhum OCR foi iniciado.
