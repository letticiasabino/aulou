# Production Smoke Test

| Cenário | Resultado esperado | Resultado atual | Status |
|---|---|---|---|
| `GET /api/health` | HTTP 200, status ok, sem secrets | Validado localmente | Pendente em produção |
| Cadastro/login | sessão criada e protegida | Validado E2E local | Pendente Supabase |
| Onboarding | dados persistem após reload | Validado local-first | Pendente Supabase |
| Upload | MIME, extensão e tamanho respeitados | Validado localmente | Pendente Storage produção |
| RLS com dois usuários | isolamento completo | Não executado sem projeto | Bloqueado |
| Feedback | persiste no Supabase | Migration pronta, não aplicada | Bloqueado |
| IA | resposta estruturada ou erro seguro | Validado com mock/local | Pendente chave produção |
| Checkout | claramente mockado, sem pagante falso | Validado localmente | Pendente provedor real |

Evidências locais: `npm run e2e`, `npm run test`, `npm run build`.
