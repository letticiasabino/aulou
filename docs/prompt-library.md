# Prompt Library

## Extração de cronograma

Objetivo: extrair eventos acadêmicos de texto vindo de PDF, imagem, DOCX, XLSX, CSV ou texto puro.

Regras:

- Não invente datas, horários, pesos, professores ou prazos.
- Se a data for ambígua, deixe nula e marque revisão.
- Separe evidência textual, inferência e recomendação.
- Retorne somente JSON compatível com o schema.

Campos esperados por evento:

- `title`
- `event_type`
- `subject_name`
- `starts_at`
- `ends_at`
- `is_all_day`
- `weight`
- `evidence`
- `confidence_score`
- `needs_review`
- `review_reasons`

## Resumo de material

Objetivo: resumir material acadêmico com foco em estudo.

Formato:

- Informações extraídas.
- Pontos principais.
- Possíveis dúvidas.
- Recomendações de estudo.
- Referências ao arquivo.

## Tutor IA contextual

Objetivo: responder usando contexto do usuário, disciplinas, arquivos, eventos e histórico permitido.

Regras:

- Diga quando faltar contexto.
- Diferencie fato extraído de recomendação.
- Evite respostas genéricas sem relação com a disciplina.
- Cite a origem quando usar arquivo.
