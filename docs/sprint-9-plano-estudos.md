# Sprint 9 - Plano de Estudos

## Escopo

Planejamento diário e semanal baseado em provas, trabalhos, fóruns, prazos, peso, dificuldade e disponibilidade.

## Regras implementadas

- Provas têm prioridade máxima e prazos mais próximos entram primeiro.
- A dificuldade e o peso aumentam o tempo estimado.
- Cada dia respeita a capacidade configurada; excesso vira `unscheduledMinutes`.
- Tarefas são divididas em sessões de até 60 minutos.
- Tarefas atrasadas podem ser reagendadas para hoje e ficam marcadas como atrasadas.
- Planos e tarefas têm fallback local-first e migration Supabase com RLS.
