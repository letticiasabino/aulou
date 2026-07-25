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

## Retomada com credenciais locais - 2026-07-16

- `backend/.env.local` existe e aparece como ignorado no status do Git; as sete variaveis exigidas estao presentes sem registrar valores.
- API iniciada localmente com `APP_ENVIRONMENT=test`: `/health` retornou `ok` e `/ready` retornou `ready`.
- Nao foram criados dados remotos. O backend nao possui rota de upload nem rota de cancelamento, portanto nao ha como executar o fluxo real exigido para criar fixtures e cancelar jobs sem usar operacoes administrativas fora do contrato da API.
- O estado terminal implementado pela fila e `dead`, nao `dead_letter`; essa diferenca deve ser resolvida por decisao de produto/contrato antes de declarar o criterio de dead letter atendido.
- O worker nao produziu o log de inicio capturavel no processo curto. Ele nao apresentou `production`; a execucao controlada com credenciais deve ser retomada apos definir o roteiro de upload/cancelamento autorizado.
- Protecao de senhas vazadas: **ACAO MANUAL PENDENTE**, conforme advisor remoto de 2026-07-15.

## Execucao remota isolada - 2026-07-16

- Usuario artificial criado por service role e autenticado pelo fluxo de senha com chave publicavel; nenhum identificador, senha, JWT ou conteudo foi registrado.
- Oito fixtures artificiais foram enviados sob o prefixo do usuario. O worker iniciou com `environment=test`, fila unica `file-extraction` e concorrencia efetiva 1.
- Resultados: PDF textual `completed`; PDF escaneado provavel `ocr_required`; DOCX `completed`; XLSX `completed`; CSV com virgula e ponto-e-virgula `completed`; imagem `ocr_required`. Nenhum OCR foi executado.
- CSV corrompido: falha segura, retry apos backoff de 15 segundos e estado terminal `dead` depois de duas tentativas controladas. O contrato chama esse estado de `dead`, nao `dead_letter`.
- Idempotencia foi exercitada reutilizando a mesma chave para o PDF textual, sem criar segunda extracao/job.
- A tentativa de cancelamento nao constitui evidencia valida: nao existe endpoint/contrato de cancelamento. Permanece pendente, sem alterar a arquitetura nesta tarefa.
- Producao antes/depois: 24 jobs `production/file-extraction`; nenhum foi reivindicado, alterado ou reprocessado.
- Limpeza concluida pelo roteiro: objetos do bucket, jobs/extracoes de teste e usuario artificial foram removidos.

# Retentativa controlada — 2026-07-24

O smoke remoto da Sprint 5.5 não foi iniciado: a única rodada de diagnóstico falhou antes de autenticação ou mutação com `ENOTFOUND` para o host do projeto e timeout de login role na CLI. Nenhum usuário artificial, objeto, extraction ou job foi criado, e os 24 jobs `production/file-extraction` não foram consultados nem alterados nesta rodada. O bloqueio é externo de DNS/conectividade; não repetir até a conectividade ser restabelecida.

## Diagnóstico final de homologação — 2026-07-24

O CLI confirmou o projeto `kcylfykwctjbgayajign` (`aulou`, organização `fptfiqiwlnsvfrpxckpw`, `us-east-2`) e vínculo local corretos, mas com status `INACTIVE`. DNS padrão, Cloudflare e Google responderam NXDOMAIN para o host do projeto, enquanto `https://supabase.co` respondeu 200. A causa provável é a inatividade do projeto, não um problema local de proxy, cache ou host. Não houve reativação automática, pois ela pode gerar impacto operacional ou financeiro. A migration `20260724000000_upload_intent_expiry_and_extraction_cancellation_scope.sql` não foi aplicada; smoke, RLS remoto, advisors e leaked password protection continuam pendentes.
