# Sprint de Produção — Deploy, Supabase, Monitoramento e Beta Real

## Estado real

- Build local: aprovado anteriormente e revalidado durante a sprint.
- Deploy público: `BLOQUEADO POR ACESSO EXTERNO`; não há sessão Netlify/Vercel nem URL de produção.
- Supabase Production: `BLOQUEADO POR ACESSO EXTERNO`; CLI não instalado e nenhum projeto remoto identificado.
- Feedback: migration e RLS versionados; aplicação remota ainda não executada.
- Health check: disponível em `/api/health`, com `status`, `service` e `environment`, sem secrets.

## Próximas ações externas

1. Criar projeto Supabase Production, aplicar migrations em ordem e configurar Auth/Storage/RLS.
2. Criar projeto de hosting e configurar as variáveis de `.env.example` no ambiente Production.
3. Publicar domínio, atualizar `NEXT_PUBLIC_SITE_URL` e configurar redirects `/login`, `/register`, `/reset-password` e `/auth/callback`.
4. Executar `rules/SMOKE-TEST.md` com dois usuários reais de teste.
5. Configurar uptime a cada 5 minutos para `/api/health` e um canal de alerta.

## Observações

`npm ci` ficou bloqueado localmente por `EPERM` ao tentar substituir o binário nativo `lightningcss` em `node_modules`; as validações usaram as dependências já instaladas. O `npm audit` anterior não conseguiu consultar o registry por falha de rede.
