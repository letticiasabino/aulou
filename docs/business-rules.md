# Regras de Negócio

## Importação de cronograma

- Nenhum evento extraído por IA entra automaticamente na agenda sem preview, exceto se o usuário ativar modo automático.
- Todo evento extraído deve ter `confidence_score`.
- Todo evento extraído deve ter `source_file_id`.
- Confiança menor que 80%: status `needs_review`.
- Confiança de 80% a 94%: status `probable`.
- Confiança igual ou maior que 95%: status `high_confidence`.
- Data ambígua não deve ser inventada.
- Horário ausente gera evento de dia inteiro.
- Disciplina não identificada vira `Sem disciplina` e exige revisão.
- Usuário pode editar todos os campos antes de confirmar.
- Importações atualizadas devem detectar duplicidade por origem, data, título, disciplina e tipo.

## Agenda

- Provas têm prioridade máxima.
- Trabalhos próximos do prazo têm alta prioridade.
- Aulas comuns têm prioridade média.
- Materiais opcionais têm prioridade baixa.
- Eventos vencidos geram alerta.
- Conflitos de horário devem ser sinalizados antes da confirmação.

## Plano de estudos

- Considera data da prova.
- Considera peso da avaliação.
- Considera dificuldade informada pelo usuário.
- Considera tempo disponível.
- Considera atrasos e tarefas não concluídas.
- Reorganiza tarefas quando o usuário falha em cumprir o plano.

## Monetização

- Free tem limites baixos e suficiente valor para ativação.
- Plus desbloqueia mais volume, flashcards, quizzes, plano semanal e lembretes avançados.
- Pro desbloqueia IA Tutor avançada, importações maiores, relatórios, prioridade e integrações futuras.
- Bloqueios devem explicar o benefício do upgrade e preservar o trabalho já feito.
