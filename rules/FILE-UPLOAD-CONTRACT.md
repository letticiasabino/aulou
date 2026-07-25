# Contrato de upload de arquivos

Uploads usam um intent autenticado, não multipart pela API. `POST /v1/files/upload-intents` aceita somente PDF, DOCX, XLSX, CSV, PNG, JPEG e WebP, com tamanho maior que zero e no máximo 10 MB. O servidor determina usuário, bucket privado `academic-files`, UUID do arquivo, caminho `{userId}/{fileId}/{nome-sanitizado}`, expiração e chave de idempotência.

A URL temporária é devolvida somente para o envio ao Storage e nunca é persistida nem registrada em logs. `POST /v1/files/upload-intents/:id/complete` confirma ownership, expiração e objeto/bytes esperados antes de criar o metadado `files` como `uploaded`; chamadas repetidas são idempotentes. Intents ou arquivos de outro usuário são indistinguíveis de inexistentes na API.

`GET /v1/files` é paginado e só retorna arquivos próprios não excluídos. `DELETE /v1/files/:id` é idempotente e retorna conflito enquanto existir job de extração `pending`, `retry` ou `running` para o arquivo. Objetos e metadados são privados; RLS real permanece parte do smoke remoto.

Uma extração só pode ser solicitada para arquivo `uploaded`. A solicitação cria/reutiliza `file_extraction` e job idempotente na fila server-side `file-extraction`, no ambiente configurado no servidor. Cliente não escolhe ambiente, fila, usuário ou caminho.
