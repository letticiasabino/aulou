# Sprint 5 - Upload de Arquivos

## Escopo

Upload seguro de PDF, imagens PNG/JPEG/WEBP, DOCX, XLSX, CSV e TXT. A biblioteca exibe metadados, status do upload e status da extração.

## Critérios de aceite

- Arquivos vazios, acima de 10 MB, com extensão desconhecida ou MIME incompatível são rejeitados.
- O registro de metadados é separado do conteúdo binário.
- Supabase usa o bucket privado `academic-files` com path iniciado pelo `user_id`.
- Sem Supabase configurado, o fallback local mantém apenas metadados.
- A extração permanece `pending` com provider `mock`; IA real será conectada em sprint posterior.
