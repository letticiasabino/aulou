# Sprint 12 — Notificações e RiskEngine

## Entrega

- `RiskEngine` calcula Academic Health Score de 0 a 100, nível de risco, fatores e recomendações.
- O score considera eventos vencidos, tarefas atrasadas, avaliações próximas e concentração de compromissos.
- `NotificationEngine` gera alertas de prazo, provas próximas, eventos/tarefas atrasados e risco alto.
- Notificações podem ser marcadas como lidas e funcionam em modo local-first.
- Supabase recebeu tabela `notifications` com RLS por usuário.
- `/notifications` centraliza alertas e `/progress` apresenta a saúde acadêmica.

## Regras

O cálculo é determinístico e não depende de IA. Apenas eventos confirmados vindos da agenda são considerados. Alertas são idempotentes por identificador derivado do tipo e do registro relacionado. O score é um indicador de apoio, não uma avaliação acadêmica definitiva.

## Critérios de aceite

- [x] Alertas de prazos próximos e vencidos.
- [x] Detecção de tarefas atrasadas.
- [x] Academic Health Score explicável.
- [x] Níveis de risco e recomendações.
- [x] Tela de notificações com estado vazio, loading e erro.
- [x] Tela de progresso com fatores do score.
- [x] Persistência Supabase preparada com RLS.
- [x] Testes unitários das engines e da migration.
