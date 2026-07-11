# Deploy e ambientes

## Vercel

1. Crie um projeto Vercel apontando para o repositório.
2. Use `npm ci` como instalação e `npm run build` como build.
3. Configure as variáveis de `.env.example` em `Preview` e `Production` separadamente.
4. Faça o primeiro deploy e valide `GET /api/health`.
5. Configure o domínio em `NEXT_PUBLIC_SITE_URL` e refaça o deploy.

O arquivo `vercel.json` mantém os comandos explícitos.

## Variáveis

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Auth, banco e Storage.
- `OPENAI_API_KEY` e `OPENAI_MODEL`: IA server-side.
- `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`: pagamentos reais futuros.
- `POSTHOG_KEY` e `POSTHOG_HOST`: analytics externo futuro.
- `RESEND_API_KEY`: e-mails futuros.
- `REDIS_URL`: rate limit e filas distribuídas futuras.

Secrets ficam somente no ambiente do provedor. Variáveis `NEXT_PUBLIC_*` são públicas por definição e nunca devem conter chaves secretas.

## Smoke test pós-deploy

```bash
curl https://SEU_DOMINIO/api/health
```

O retorno esperado contém `"status":"ok"`. Depois valide o fluxo completo do checklist de beta.
