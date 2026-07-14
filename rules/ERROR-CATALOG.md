# Aulou Error Catalog

## Dominio academico

`SEMESTER_NOT_FOUND`, `SEMESTER_DATE_RANGE_INVALID`, `SEMESTER_ALREADY_ACTIVE`, `SEMESTER_CONFLICT`, `SUBJECT_NOT_FOUND`, `SUBJECT_DUPLICATE`, `SUBJECT_SEMESTER_INVALID`, `SUBJECT_COLOR_INVALID`, `TEACHER_NOT_FOUND`, `TEACHER_DUPLICATE`, `TEACHER_EMAIL_INVALID`, `TEACHER_SUBJECT_LINK_NOT_FOUND`, `ACADEMIC_EVENT_NOT_FOUND`, `ACADEMIC_EVENT_DATE_RANGE_INVALID`, `ACADEMIC_EVENT_SUBJECT_INVALID`, `ACADEMIC_EVENT_SEMESTER_INVALID`, `ACADEMIC_EVENT_WEIGHT_INVALID` e `ACADEMIC_EVENT_CONFIDENCE_INVALID` sao mapeados para mensagens seguras e status 404, 409 ou 422.

Formato publico:

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Autenticacao necessaria.",
    "details": null,
    "requestId": "..."
  }
}
```

| Codigo                           | HTTP | Uso                                             |
| -------------------------------- | ---: | ----------------------------------------------- |
| `VALIDATION_ERROR`               |  422 | Entrada invalida segundo Zod                    |
| `AUTHENTICATION_REQUIRED`        |  401 | JWT ausente                                     |
| `INVALID_AUTH_TOKEN`             |  401 | Bearer malformado ou JWT invalido               |
| `EXPIRED_AUTH_TOKEN`             |  401 | Token expirado                                  |
| `AUTH_PROVIDER_ERROR`            |  503 | Supabase Auth indisponivel ou sem configuracao  |
| `FORBIDDEN`                      |  403 | Recurso de outro usuario                        |
| `INSUFFICIENT_PERMISSIONS`       |  403 | Role nao autorizada                             |
| `RESOURCE_ACCESS_DENIED`         |  403 | Ownership negado                                |
| `NOT_FOUND`                      |  404 | Recurso inexistente ou ocultado por ownership   |
| `CONFLICT`                       |  409 | Duplicidade, checksum ou estado incompativel    |
| `RATE_LIMIT`                     |  429 | Limite de request, IA ou plano                  |
| `INTERNAL_ERROR`                 |  500 | Falha inesperada sem detalhes sensiveis         |
| `FILE_NOT_FOUND`                 |  404 | Arquivo ausente ou pertencente a outro usuario  |
| `FILE_EXTRACTION_NOT_FOUND`      |  404 | Extracao ausente ou pertencente a outro usuario |
| `FILE_EXTRACTION_NOT_RETRYABLE`  |  409 | Estado atual nao permite retry                  |
| `FILE_EXTRACTION_LIMIT_EXCEEDED` |  422 | Arquivo ou conteudo excede limite seguro        |

Pino registra contexto tecnico e `requestId`, nunca tokens, prompts completos, documentos ou stack trace em resposta.
