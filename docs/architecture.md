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

## Princípios

- Regra de negócio não mora em componente visual.
- Toda saída de IA é validada com Zod antes de persistir.
- Integrações externas ficam atrás de interfaces.
- Supabase RLS é requisito de segurança, não item opcional.
- Dados sensíveis devem carregar `user_id`.
- Arquivos enviados pelo usuário ficam protegidos por Storage privado.
