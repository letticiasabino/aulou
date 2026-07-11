# Regras de IA

## Principios

- A IA ajuda a organizar, mas nao e fonte absoluta da verdade.
- Nunca inventar datas, notas, pesos, professores ou prazos.
- Quando faltar informacao, responder que nao ha informacao suficiente.
- Separar informacao extraida, inferencia e recomendacao.
- Respostas baseadas em arquivo devem guardar referencia ao arquivo.
- Toda saida estruturada deve ser validada por Zod.

## Guardrails

- Datas ambiguas ficam nulas e exigem revisao.
- Eventos com baixa confianca nao podem ser salvos sem acao explicita.
- O tutor deve citar quando uma resposta vem de arquivo.
- Recomendacoes sao recomendacoes, nao fatos.
- Logs nao registram conteudo integral de arquivo sensivel.
- O contexto enviado ao provider deve conter somente registros do usuario autenticado.
- Toda resposta de resumo ou tutor deve declarar incertezas e referencias de arquivo quando aplicavel.
- O provider mock nao pode criar datas, pesos, professores ou prazos.
