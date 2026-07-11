# Sprint 15 — QA, Segurança e Performance

## Verificações

- TypeScript sem erros.
- ESLint sem erros ou warnings.
- 37 arquivos de teste e 72 testes passando.
- Build de produção concluído.
- E2E público concluído com Chromium.
- Busca de secrets hardcoded, APIs perigosas, TODOs e FIXMEs sem ocorrências no código de produto.
- Headers de segurança reforçados com CSP, `X-Frame-Options`, `nosniff`, Referrer Policy e Permissions Policy.
- Endpoints de IA protegidos por limite de corpo e rate limit por origem.
- Inputs de upload e calendário revisados para nome acessível.

## Riscos residuais

- Rate limit em memória é adequado para desenvolvimento e uma única instância; produção distribuída deve usar Redis ou mecanismo equivalente.
- O CSP atual mantém `unsafe-inline` e `unsafe-eval` por compatibilidade com Next/Tailwind em desenvolvimento; endurecer após configurar nonce/hash no deploy.
- O projeto ainda não possui auditoria automatizada de dependências no pipeline CI.

## Critérios de aceite

- [x] Testes unitários, lint e typecheck.
- [x] Build e E2E.
- [x] Headers e rate limit.
- [x] Estados de erro, vazio e loading revisados nas telas principais.
- [x] Acessibilidade básica de labels e controles.
- [x] Arquivos mortos e referências quebradas investigados.
