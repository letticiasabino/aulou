# Supabase

## Sprint 4

Este diretório contém a configuração versionada do backend inicial do StudyPilot AI.

## Migration inicial

Arquivo:

- `supabase/migrations/20260710000000_initial_backend.sql`

Inclui:

- tabelas iniciais do domínio acadêmico;
- tabelas iniciais de arquivos, extrações, assinatura, limites, configurações e auditoria;
- RLS por `user_id`;
- grants para `authenticated`;
- bucket privado `academic-files`;
- policies de `storage.objects` por pasta do usuário.

## Aplicação

Quando o Supabase CLI estiver instalado e o projeto estiver conectado:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Sem CLI, a migration pode ser aplicada manualmente no SQL Editor do Supabase, preservando o arquivo versionado como fonte da verdade.

## Variáveis necessárias

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# ou, para projetos que ainda usam o nome clássico:
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
```
