# Decision Log

## 2026-07-08 - Sprint 0 inicia com documentação antes de funcionalidades

Decisão: criar documentação de produto, arquitetura, regras, segurança, monetização e testes antes de implementar features.

Motivo: o produto tem risco alto de virar uma demo solta se regras de IA, banco, limites e segurança não forem definidos primeiro.

## 2026-07-08 - OpenAI API por provider abstrato

Decisão: usar OpenAI API como provider inicial, mas encapsulada por serviço/adapter.

Motivo: evita acoplamento direto e permite trocar ou adicionar providers no futuro.

## 2026-07-08 - Supabase como backend-alvo

Decisão: usar Supabase para Auth, Postgres e Storage.

Motivo: acelera o MVP forte com autenticação, RLS, storage privado e banco relacional.

## 2026-07-08 - Preview obrigatório para eventos importados

Decisão: eventos extraídos por IA não serão persistidos diretamente na agenda sem confirmação, salvo modo automático explícito.

Motivo: datas e prazos acadêmicos são sensíveis; a IA deve apoiar, não decidir silenciosamente.

## 2026-07-08 - Conceito visual dark premium

Decisão: iniciar com dark mode premium, roxo, preto, branco e ciano suave, baseado em conceito visual gerado na Sprint 0.

Motivo: diferencia o produto de sistemas acadêmicos antigos e conversa com estudantes acostumados a apps modernos.

## 2026-07-08 - Shadcn configurado manualmente após bloqueio TLS

Decisão: criar a base Next/Shadcn manualmente e validar com `shadcn info`, porque o `shadcn init` falhou ao clonar o template remoto via Git por erro TLS local.

Motivo: manter a Sprint 0 avançando sem depender de uma configuração de máquina. O projeto continua compatível com o CLI para componentes futuros.

## 2026-07-08 - Override de PostCSS

Decisão: fixar `postcss` em versão corrigida via `overrides`.

Motivo: o audit apontou vulnerabilidade moderada no `postcss` transitivo do Next. O caminho sugerido pelo npm era downgrade inseguro do framework.

## 2026-07-08 - Raiz explícita do Turbopack

Decisão: definir `turbopack.root` em `next.config.ts`.

Motivo: havia outro lockfile fora do workspace e o Next inferiu a pasta do usuário como raiz, causando erro de permissão no build.
