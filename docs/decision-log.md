# Decision Log

## Sprint 8 - provider OpenAI server-side e mock seguro

- A OpenAI Responses API é acessada somente em Route Handlers server-side; `OPENAI_API_KEY` nunca é importada por componentes client.
- Saídas de resumo e tutor usam schemas Zod e guardrails que exigem separação entre informação extraída, inferência e recomendação.
- Sem Supabase configurado, a interface usa `MockAIProvider` e declara falta de contexto em vez de simular fatos acadêmicos.

## Sprint 7 - agenda só recebe eventos confirmados

- `academic_events` tem RLS por `user_id` e policies de insert/update exigindo `review_status = confirmed`.
- A tela usa o mesmo serviço com Supabase ou local-first, deixando a agenda funcional sem bloquear o desenvolvimento local.
- Filtros são aplicados no serviço e no banco, enquanto a interface mantém as opções de disciplinas disponíveis.

## Sprint 6 - ImportEngine sem invenção de dados

- TXT e CSV são processados localmente no navegador com parser determinístico para o primeiro ciclo.
- PDF, imagem, DOCX e XLSX entram no pipeline, mas ficam sem eventos até um extrator específico estar configurado.
- A confirmação do preview ainda não grava em `academic_events`; ela conclui a revisão local. A persistência será implementada junto da Agenda.

## Sprint 5 - upload sem IA real

- O upload registra metadados e cria uma extração `pending` com provider `mock`; não há chamada de IA nesta etapa.
- O limite inicial é 10 MB por arquivo, aplicado no cliente, na tabela `files` e no bucket `academic-files`.
- A biblioteca usa o Storage real quando Supabase está configurado e fallback local-first quando as variáveis públicas não estão presentes.

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

## 2026-07-08 - Sprint 1 usa Feature First

Decisão: organizar fluxos em `src/features/*`, mantendo `src/components/ui` para primitivos e `src/components/layouts` para cascas reutilizáveis.

Motivo: o produto vai crescer em módulos grandes. Feature First reduz acoplamento e deixa cada área evoluir sem transformar `app/` em depósito de lógica.

## 2026-07-08 - Auth Supabase com SSR e fallback seguro

Decisão: implementar Auth por Supabase SSR, mas tratar ausência de env pública como erro de configuração amigável nas telas.

Motivo: a Sprint 1 deve rodar localmente sem quebrar mesmo antes de conectar um projeto Supabase real.

## 2026-07-08 - Componentes Shadcn-compatible locais

Decisão: criar componentes base localmente, seguindo APIs Radix/Shadcn e validando o projeto com `shadcn info`.

Motivo: o `shadcn init` falhou na Sprint 0 por TLS local. Manter componentes como código próprio preserva controle e permite adicionar novos via CLI quando o ambiente permitir.

## 2026-07-08 - Conceitos visuais da Sprint 1

Decisão: gerar conceitos para landing e dashboard skeleton antes de implementar.

Motivo: a Sprint 1 é fundação visual e estrutural; conceitos ajudam a manter o produto premium, consistente e fora de uma aparência genérica.

## 2026-07-08 - Typed routes mantido com cache limpo

Decisão: manter os tipos de rota gerados pelo Next, mas limpar artefatos defasados de `.next/dev` quando eles não refletirem as rotas criadas.

Motivo: o build gerou `.next/types` com todas as rotas corretamente. O erro vinha de tipos antigos de desenvolvimento. Manter route typing ajuda a evitar links quebrados sem criar cast manual nas rotas.

## 2026-07-08 - Executor E2E próprio para Windows

Decisão: substituir o `webServer` automático do Playwright por `scripts/run-e2e.mjs`, que sobe `next start`, espera a aplicação responder, roda Playwright e encerra a árvore de processos explicitamente.

Motivo: no Windows local, o `webServer` do Playwright executava os testes com sucesso, mas ficava preso na finalização do servidor. O executor mantém `npm run e2e` com saída limpa e valida o build de produção.

## 2026-07-09 - Sprint 2 local-first para domínio acadêmico

Decisão: implementar perfil, curso, semestre, disciplinas e professores por service local-first, com contratos compatíveis com Supabase.

Motivo: o Supabase CLI não está instalado neste ambiente. Criar uma migration manual sem o CLI violaria o fluxo seguro. O app fica funcional localmente e pronto para conectar as tabelas reais quando o ambiente Supabase estiver disponível. O changelog oficial foi consultado via Node; a mudança de 2026-04-28 sobre tabelas não serem expostas automaticamente reforça que a migration futura deve incluir grants explícitos além de RLS.

## 2026-07-10 - Sprint 3 endurece o domínio acadêmico antes de upload

Decisão: tratar a Sprint 3 solicitada como evolução do domínio acadêmico, deslocando Upload e Importação para a próxima sprint no roadmap.

Motivo: o produto precisa de uma base acadêmica editável e confiável antes de importar cronogramas. Foi adicionada uma entidade local-first de faculdade (`institution`) para deixar o contrato mais próximo de um banco real, mantendo compatibilidade com os campos já existentes em `profiles` e `courses`.

## 2026-07-10 - Sprint 4 cria backend Supabase sem exigir projeto remoto

Decisão: versionar migrations, RLS, storage, tipos de banco e integração frontend/backend, mas não aplicar migration remota neste ambiente.

Motivo: não há projeto Supabase conectado nem CLI garantido no workspace. A aplicação fica pronta para backend real quando as envs públicas forem configuradas, preservando o fallback local para desenvolvimento e testes automatizados.
