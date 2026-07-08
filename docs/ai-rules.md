# Regras de IA

## Princípios

- A IA ajuda a organizar, mas não é fonte absoluta da verdade.
- Nunca inventar datas, notas, pesos, professores ou prazos.
- Quando faltar informação, responder que não há informação suficiente.
- Separar sempre informação extraída, inferência e recomendação.
- Respostas baseadas em arquivo guardam referência ao arquivo.
- Toda saída estruturada deve ser validada por Zod.

## Saída de eventos

Cada evento extraído deve conter:

- título;
- tipo;
- disciplina ou `Sem disciplina`;
- data, quando inequívoca;
- horário, se existir;
- `is_all_day`;
- peso, se existir;
- evidência textual;
- `confidence_score`;
- motivo da confiança;
- campos que precisam revisão.

## Guardrails

- Datas ambíguas ficam nulas e exigem revisão.
- Eventos com baixa confiança não podem ser salvos sem ação explícita.
- O tutor deve citar quando uma resposta vem de arquivo.
- Recomendações devem ser marcadas como recomendação, não fato.
- Logs não devem registrar conteúdo integral de arquivo sensível.
