# Aulou

Assistente academico com IA para transformar cronogramas e materiais universitarios em agenda, planos de estudo e revisoes acionaveis.

## Desenvolvimento

```bash
npm ci
Copy-Item .env.example .env.local
npm run dev
```

## Qualidade do frontend

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run e2e
npm run build
```

## API backend

O backend separado em `backend/` usa Node.js, TypeScript, Fastify, Zod, Pino, Swagger e Vitest. A Sprint Backend 5 implementa extracao local de PDF, DOCX, XLSX e CSV, classificando imagens e PDFs escaneados para OCR futuro sem executar OCR ou IA.

```bash
npm --prefix backend install
npm run backend:dev
npm run backend:test
npm run backend:build
```

Localmente, a API fica em `http://localhost:4000`, com health em `/health`, readiness em `/ready`, Auth em `/v1/auth/me`, extracoes em `/v1/file-extractions` e Swagger em `/docs`.

## Producao

O frontend permanece no Netlify; Supabase continua como Auth, Postgres, Storage e RLS; API e worker estao preparados no blueprint Render com `autoDeploy: false`. Nenhum servico foi publicado nesta sprint.

## Seguranca

Nunca versione `.env.local`, chaves de API, tokens ou credenciais. Secrets do backend ficam somente no ambiente do servico. O checkout real, limites pagos e persistencia server-side devem ser validados antes do beta comercial.

## Documentacao

- `backend/README.md`: fundacao e proximo incremento.
- `rules/BACKEND-ARCHITECTURE.md`: auditoria e separacao de responsabilidades.
- `rules/API-CONTRACTS.md`: endpoints planejados.
- `rules/ERROR-CATALOG.md`: resposta padrao de erros.
- `rules/BACKEND-SECURITY.md`: controles server-side.
- `rules/BACKEND-ROADMAP.md`: sprints futuras.
