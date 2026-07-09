# Arquitetura

## Stack-alvo

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- Shadcn/UI.
- Supabase Auth, PostgreSQL e Storage.
- Zod para validação.
- React Hook Form para formulários.
- TanStack Query para estado assíncrono.
- OpenAI API via provider abstrato.
- Fila futura via BullMQ + Redis ou adaptador equivalente.
- Stripe ou Mercado Pago via camada de pagamentos.
- Resend para e-mails.
- PostHog ou Umami para analytics.
- Vitest e Playwright para testes.

## Camadas

- `src/app`: rotas, layouts e server actions.
- `src/components`: componentes visuais reutilizáveis.
- `src/features`: fluxos de produto por domínio.
- `src/engines`: regras de negócio puras.
- `src/services`: integrações externas e persistência.
- `src/schemas`: contratos Zod.
- `src/types`: tipos compartilhados.
- `src/config`: planos, limites, flags e env.
- `src/tests`: utilitários de teste.

## Sprint 1 - Feature First

A Sprint 1 organiza a aplicação em Feature First:

- `src/features/marketing`: landing, pricing e conteúdo público.
- `src/features/auth`: login, cadastro, recuperação e reset de senha.
- `src/features/dashboard`: app shell e placeholders logados.
- `src/features/onboarding`: fluxo visual preparado para persistência futura.
- `src/components/ui`: primitivos reutilizáveis compatíveis com Shadcn/UI.
- `src/components/layouts`: landing, auth, dashboard e erro.
- `src/components/providers`: tema, query, Supabase, toast e modal.
- `src/services`: integrações desacopladas.

Adaptação: os engines já existem em `src/engines` desde a Sprint 0 com implementação mínima testada. Na Sprint 1 eles serão preservados e complementados com placeholders quando o motor ainda não deve executar regra nova.

## Princípios

- Regra de negócio não mora em componente visual.
- Toda saída de IA é validada com Zod antes de persistir.
- Integrações externas ficam atrás de interfaces.
- Supabase RLS é requisito de segurança, não item opcional.
- Dados sensíveis devem carregar `user_id`.
- Arquivos enviados pelo usuário ficam protegidos por Storage privado.
