# Testing Rules

## Backend Sprint 3

Cobrir schemas de intervalo de datas, cor, peso, filtros e rejeicao de `user_id`. Testes de integracao devem validar 401, 404, 409, paginacao e isolamento entre usuarios. RLS real permanece pendente enquanto nao houver ambiente de teste autorizado.

- Every release must pass format check, typecheck, lint, unit tests and production build.
- E2E must cover public routes, authentication/onboarding, health check and security headers.
- Migrations require tests that verify RLS, grants and ownership predicates.
- Production smoke tests must record expected result, observed result, evidence and correction.
- Tests must not depend on production credentials or real user data.
- Backend Auth tests must mock Supabase and cover missing, malformed, invalid and expired Bearer tokens, valid users, role denial and role approval.
- A real Supabase token test is separate evidence and must use dedicated test accounts, never personal credentials.

## Backend Sprint 5

- Jobs devem testar idempotencia, classificacao de lembretes, claim exclusivo, recuperacao de lock expirado, backoff e estado terminal.
- E-mail nunca pode ser considerado enviado sem ID retornado pelo provedor.
- O smoke test real deve criar/alterar um evento confirmado, observar o job, a notificacao do usuario correto e o isolamento de uma segunda conta.
- Extracao deve cobrir PDF textual, PDF provavelmente escaneado, DOCX, XLSX, CSV, imagem, corrupcao, limites, normalizacao e metricas.
- Rotas devem provar idempotencia, validacao, retry e isolamento entre usuarios A/B.
- Handler deve provar `processing -> completed`, falha segura, retry/backoff e despacho separado de notificacoes.

## Validacao de infraestrutura pos-Sprint 5 (2026-07-14)

- A suite local passou com 41 testes em 9 arquivos, alem de lint, typecheck e build.
- A prova em Supabase real continua `BLOQUEADO POR ACESSO EXTERNO`: nao havia CLI, Docker, configuracao do projeto remoto ou credenciais de teste autorizadas.
- O roteiro e as evidencias, inclusive itens nao executados, estao em `rules/SPRINT-5-INFRASTRUCTURE-VALIDATION.md`.

## Execucao remota (2026-07-15)

- RLS e Storage foram exercitados com dois usuarios artificiais: isolamento de arquivos, extracoes, jobs e notificacoes foi confirmado; o bucket permaneceu privado.
- A API recebeu requisicoes autenticadas de extracao e o worker processou uma falha CSV controlada com segunda tentativa apos backoff.
- A cobertura remota integral de formatos e dead letter esta bloqueada por fila compartilhada sem isolamento de usuario/ambiente. Nao executar worker global novamente ate haver ambiente de teste dedicado.
