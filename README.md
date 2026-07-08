# StudyPilot AI

Assistente acadêmico com IA para organizar cronogramas, agenda, estudos e materiais universitários.

## Sprint atual

Sprint 0 concluída: documentação, arquitetura, design system, projeto base, engines iniciais e testes unitários.

## Rodar localmente

```bash
npm install
npm run dev
```

O app abre em `http://localhost:3000`.

## Validações

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm audit --audit-level=moderate
```

## Documentação

A documentação inicial fica em `docs/`, com decisões em `docs/decision-log.md`.

## Segurança

Não commitar `.env.local`. Use `.env.example` como referência de variáveis.
