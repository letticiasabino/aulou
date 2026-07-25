# Cancelamento de jobs de extração

`POST /v1/jobs/:id/cancel` exige autenticação e ownership. O contrato é restrito a jobs `file_extraction` em `pending` ou `retry`: marca `cancelled`, preserva `environment` e `queue_name`, remove lock e é idempotente quando já cancelado. Jobs `running`, `completed` e `dead` retornam conflito; não há alegação de cancelamento imediato cooperativo.

`cancelled` e `dead` são estados terminais. O worker só reivindica `pending` e `retry`, portanto ignora cancelados e mortos. `dead` é o estado persistido após tentativas esgotadas; “dead letter” é apenas o conceito operacional, não um valor de status. Retry nunca deve ressuscitar um job cancelado nem movê-lo entre ambiente ou fila.
