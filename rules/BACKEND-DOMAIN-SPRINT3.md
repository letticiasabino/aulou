# Backend Sprint 3 - Dominio academico

## Escopo

Implementados os CRUDs protegidos de semestres, disciplinas, professores e eventos academicos, com paginacao e filtros. Todas as operacoes usam o usuario derivado do JWT Supabase; `user_id` nao e aceito nos payloads.

## Rotas

- `/v1/semesters`
- `/v1/subjects`
- `/v1/teachers`
- `/v1/subjects/:subjectId/teachers`
- `/v1/academic-events`

As respostas de listagem usam `data` e `meta` com `page`, `limit`, `total` e `totalPages`. O limite maximo e 100.

## Propriedade e RLS

O backend filtra toda consulta por `user_id` autenticado e usa o cliente Supabase configurado com o bearer token. A migration cria FKs compostas `(entity_id, user_id)` para impedir vinculos entre usuarios. O teste real com dois usuarios e a aplicacao remota da migration estao bloqueados por credenciais de ambiente de teste.

## Exclusao

Semestres, disciplinas e eventos sao arquivados para preservar historico. Professores sao excluidos apenas quando nao possuem vinculos; vinculos N:N sao removidos sem excluir o professor.

## Limitacoes

Nao foram implementados upload, importacao, IA, OCR, notificacoes, recorrencia, jobs ou sincronizacao externa.
