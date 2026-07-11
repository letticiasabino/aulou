# StudyPilot AI

Assistente acadêmico com IA para transformar cronogramas e materiais universitários em agenda, plano de estudos e revisões acionáveis.

## Desenvolvimento

```bash
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. Sem Supabase configurado, o app usa o modo local-first para permitir testes do beta sem backend remoto.

## Qualidade

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run e2e
npm run build
```

## Produção

O deploy recomendado é Vercel. Importe o repositório, use `npm ci` e configure as variáveis de `.env.example` no ambiente `Production`. O projeto ainda não possui URL pública: deploy e Supabase Production estão `BLOQUEADOS POR ACESSO EXTERNO`. Depois do deploy, valide `/api/health`, login, onboarding, upload, agenda, IA, assinatura e `/feedback`.

Para migrations, instale o Supabase CLI, autentique o projeto e aplique os arquivos de `supabase/migrations` em ordem. Não execute migrations de produção sem revisar RLS e backups.

## Documentação

- `docs/deploy.md`: deploy, ambientes e variáveis.
- `docs/beta-checklist.md`: checklist de entrada do beta fechado.
- `docs/sprint-16-beta-deploy.md`: escopo e critérios desta sprint.
- `docs/decision-log.md`: decisões arquiteturais.

## Segurança

Nunca versione `.env.local`, chaves de API, tokens ou credenciais. O checkout real, limites pagos e persistência de feedback devem ser validados server-side antes de produção pública.
