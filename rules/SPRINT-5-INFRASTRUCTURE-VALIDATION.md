# Validacao de infraestrutura - pos-Sprint Backend 5

Data: 2026-07-14

## Resultado

Status geral: `BLOQUEADO POR ACESSO EXTERNO`.

Nenhuma migration foi aplicada e nenhum dado remoto foi criado ou alterado nesta validacao. Isso evita aplicar SQL sem confirmar o projeto, a organizacao, o ambiente, o historico remoto e a estrategia de rollback.

## Projeto Supabase

- Projeto remoto esperado: `kcylfykwctjbgayajign`.
- O arquivo local `supabase/config.toml` identifica somente o projeto local `aulou`.
- Nao ha `SUPABASE_PROJECT_REF` nem URL Supabase configurada no ambiente local para confirmar que o remoto esperado e o alvo correto.
- A CLI `supabase` e o Docker nao estao disponiveis neste ambiente.

Consequentemente, nao foi possivel listar migrations remotas, confirmar organizacao/ambiente, verificar tabelas existentes, executar backup, aplicar migrations, consultar policies ou executar advisors.

## Migrations pendentes de validacao remota

- `20260714181441_backend_sprint5_jobs_notifications.sql`
- `20260714185103_backend_sprint5_file_extractions.sql`

O codigo versionado declara `background_jobs`, `notifications`, `notification_deliveries` e a extensao incremental de `file_extractions`. A confirmacao de tabelas, constraints, indices, funcoes, grants, RLS e triggers no banco remoto permanece pendente.

## Storage, RLS e dois usuarios

Nao foram criados usuarios de teste nem objetos artificiais. Assim, continuam sem evidencia remota: bucket privado `academic-files`, isolamento A/B, URL assinada e expiracao, download por worker, ownership de arquivos/extracoes/jobs e bloqueio de operacoes cruzadas.

## Jobs, worker e formatos

Nao foi possivel iniciar API e worker contra Supabase real. Claim atomico, lock expirado, progresso, retry/backoff, dead letter, persistencia e os formatos PDF, DOCX, XLSX, CSV e imagem aguardam smoke test remoto com arquivos artificiais. Nenhum OCR foi iniciado ou executado.

## Validacao local executada

- `npm ci`: aprovado.
- `npm run lint`: aprovado.
- `npm run typecheck`: aprovado.
- `npm run test`: 41 de 41 testes aprovados em 9 arquivos.
- `npm run build`: aprovado.
- `git diff --check`: aprovado; ha somente avisos de conversao de fim de linha em alteracoes locais preexistentes.

O primeiro teste dentro do sandbox falhou antes de carregar o Vitest devido a permissao de leitura do esbuild. A mesma suite, executada fora do sandbox, passou integralmente. Esse fato nao indica falha de codigo.

## GitHub

- Branch local: `main`, seis commits a frente de `origin/main`.
- Remote configurado: `https://github.com/letticiasabino/aulou.git`.
- Commits confirmados: `7fe7da3`, `704e6c0`, `e17d4d6`, `9538657`, `a885123` e `0def5af`.
- `gh` nao esta instalado, portanto a autenticacao e publicacao segura nao puderam ser verificadas conforme o procedimento de publicacao.
- Nenhum push foi tentado.

## Proximo procedimento autorizado

1. Instalar e autenticar a CLI Supabase, confirmar explicitamente projeto, organizacao e ambiente de teste.
2. Gerar ou confirmar backup e listar o historico remoto antes de `supabase db push`.
3. Aplicar as migrations em ordem e executar consultas de schema, RLS e grants.
4. Criar `usuario_a` e `usuario_b` de teste e rodar o roteiro de Storage, jobs, retries, dead letter e formatos com dados artificiais.
5. Instalar/autenticar `gh`, revisar a arvore de trabalho mista e publicar sem `--force` somente apos a evidencia remota.

Nao iniciar a Sprint 6 ou OCR antes de concluir esses passos.
