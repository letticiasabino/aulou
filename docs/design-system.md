# Design System

## Direção visual

Dark mode elegante como padrão, com opção light no futuro. A interface deve parecer inteligente, acolhedora, organizada, premium e rápida.

## Referência visual

Conceito gerado para Sprint 0: `docs/assets/dashboard-concept.png`.

Conceitos gerados para Sprint 1:

- Landing page: `docs/assets/sprint1-landing-concept.png`.
- Dashboard skeleton: `docs/assets/sprint1-dashboard-concept.png`.

## Tokens iniciais

- Background: preto suave e superfícies near-black.
- Texto: branco e cinzas de alto contraste.
- Acento primário: violeta.
- Acento secundário: ciano suave.
- Estados: verde para concluído, amarelo para atenção, vermelho para risco.
- Raios: até 8px para cards e superfícies.
- Tipografia: sans-serif moderna, legível em dashboards densos.

## Componentes esperados

- Sidebar.
- Topbar com busca/comando.
- Cards de resumo.
- Timeline de agenda.
- Preview de eventos importados.
- Tabelas compactas.
- Formulários acessíveis.
- Estados de loading, erro e vazio.
- Bloqueios premium elegantes.

## UX

- Fluxos devem reduzir ansiedade, não adicionar etapas inúteis.
- Todo dado extraído por IA precisa mostrar fonte e confiança.
- Telas logadas priorizam trabalho real, não marketing.
- CTAs principais usam verbo claro: importar, confirmar, gerar, revisar.

## Sprint 1 - Tokens refinados

- Fundo: preto profundo com superfícies near-black.
- Primário: roxo vivo e acessível.
- Secundário: branco/cinza frio para leitura.
- Acento: ciano usado com moderação para status e foco.
- Raio: 8px por padrão.
- Bordas: finas, discretas e contrastadas.
- Movimento: microinterações curtas, respeitando `prefers-reduced-motion`.
- Tipografia: Inter via `next/font`, com fallback sans-serif.
