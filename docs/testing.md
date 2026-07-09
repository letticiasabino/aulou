# Testes

## Camadas

- Unitários com Vitest para engines, schemas e regras.
- Componentes principais com Testing Library.
- E2E com Playwright para fluxos críticos.

## Casos obrigatórios

- Validação de eventos extraídos.
- Cálculo de confiança.
- Anti-duplicidade.
- Criação de eventos.
- Limites por plano.
- Geração de plano de estudos.
- Regras da IA.
- Componentes principais.
- Fluxo de importação.

## Critério de qualidade

Todo bug corrigido em regra de negócio deve receber teste. Toda engine nova deve nascer com testes unitários mínimos.

## Sprint 0

Cobertura inicial criada para:

- classificação de confiança;
- revisão obrigatória em baixa confiança, data ambígua e disciplina ausente;
- deduplicação em preview;
- conflito de agenda;
- limites por plano;
- geração básica de tarefas de estudo.

## Sprint 1

Adicionar testes básicos para:

- renderização da landing.
- renderização do dashboard skeleton.
- schema de autenticação.
- helpers de analytics.
- smoke E2E das rotas públicas principais.

Configuração final:

- `npm run test` executa Vitest e ignora os testes E2E.
- `npm run e2e` executa `next build`, sobe `next start` em porta dedicada e roda Playwright contra o build de produção.
- Playwright usa Chrome instalado no sistema local para evitar download de navegador no ambiente Windows atual.
