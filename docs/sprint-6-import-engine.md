# Sprint 6 - ImportEngine

## Escopo

TXT e CSV usam extração real no navegador. PDF, imagem, DOCX e XLSX entram no pipeline, mas permanecem pendentes sem parser específico ou IA configurada.

## Regras implementadas

- Eventos passam pelo schema Zod.
- Todo evento recebe `sourceFileId`, `confidenceScore`, evidência e status de revisão.
- Datas ausentes não são inventadas.
- Confirmação exige preview editável e nova validação Zod.
- Nenhum evento é persistido automaticamente; a gravação será conectada à Agenda.
