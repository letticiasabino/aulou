# Isolamento de ambiente da fila

Cada registro de `background_jobs` possui `environment` (`development`, `test`, `staging` ou `production`) e `queue_name`. O tipo do job determina a fila centralmente: `file_extraction` usa `file-extraction` e `academic_event_reminder` usa `notification`.

O cliente nao escolhe ambiente. A API o envia para a RPC exclusiva de servico a partir de `APP_ENVIRONMENT`. O worker exige `WORKER_ENVIRONMENT` e `WORKER_QUEUES`; valores ausentes, vazios ou desconhecidos interrompem a inicializacao. O claim atomico sempre filtra ambos.

Retries, cancelamentos e dead-letter preservam `environment` e `queue_name`. Testes e smoke tests remotos devem usar somente `environment=test` e remover objetos, extracoes, jobs e usuarios artificiais depois da evidencia minima ser registrada.

Jobs existentes foram preservados: a migration somente marca como `test` registros que possam ser ligados a fixtures identificaveis `sprint5-*@example.test`; sem essa evidencia, o valor conservador e `production`. Nesta aplicacao os 24 registros preexistentes nao tinham essa evidencia e ficaram em `production`. Nenhum deles e reprocessado pela migration.

`notification_deliveries` foi adiado para NotificationEngine: nao ha requisito atual de auditoria de provider, tentativa ou reenvio. Antes do beta publico, habilitar manualmente a protecao de senhas vazadas no Dashboard do Supabase. OCR real permanece fora desta sprint.
