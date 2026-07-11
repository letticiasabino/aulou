# Sprint 7 - Agenda Acadêmica

## Escopo

Eventos confirmados importados e eventos criados manualmente podem ser listados, editados e filtrados por disciplina, tipo e período.

## Regra de persistência

O fluxo de importação só chama `confirmImportedEvents` depois que o usuário revisa o preview. A migration também exige `review_status = confirmed` nas policies de insert e update.

## Limite conhecido

Sincronização com Google Calendar e Outlook permanece fora desta sprint.
