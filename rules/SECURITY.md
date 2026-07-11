# Security Rules

## Sprint 7 - confirmação e agenda

- O cliente não é a única barreira: as policies de `academic_events` rejeitam insert/update com status diferente de `confirmed`.
- Eventos importados preservam `source_file_id` e `confidence_score` para rastreabilidade.
- Filtros nunca removem o predicado de `user_id` no repositório Supabase.

## Sprint 5 - arquivos

- A aplicação valida extensão, MIME quando fornecido e limite de 10 MB antes de criar o upload.
- Banco e bucket repetem o limite de 10 MB e a lista de MIME permitidos como defesa em profundidade.
- A tabela de metadados é criada antes do upload; falhas do Storage marcam o arquivo como `failed`.

## Supabase Auth

- O cliente usa apenas URL pública e publishable/anon key.
- `SUPABASE_SECRET_KEY` ou service role nunca podem entrar em código client-side.
- Middleware deve proteger todas as rotas privadas, incluindo páginas adicionadas depois da Sprint 1.
- Autorizações não podem depender de `user_metadata`.

## Row Level Security

- RLS é obrigatório em todo dado sensível.
- Policies devem usar `to authenticated`.
- `insert` e `update` precisam de `with check`.
- Para updates, manter `using` e `with check` para impedir troca indevida de `user_id`.
- Não criar policies genéricas para `anon` em tabelas acadêmicas, arquivos, assinaturas ou logs.

## Storage

- Arquivos acadêmicos são privados por padrão.
- Usuário só pode ler, criar, atualizar ou remover objetos dentro da pasta com seu próprio `user_id`.
- Nome de arquivo deve ser tratado como metadado não confiável.
- Uploads devem respeitar limite de tamanho e MIME type no bucket e na aplicação.
- Logs não devem conter conteúdo de arquivo, token, chave, prompt completo ou resposta integral da IA.

## Dados e auditoria

- `audit_logs` guarda ação, entidade e metadados mínimos, sem payload sensível.
- `file_extractions.safe_error` pode guardar erro higienizado; `raw_text` deve ser tratado como conteúdo sensível.
- Exclusão futura de conta deve remover ou anonimizar dados relacionados por `user_id`.

## Variáveis de ambiente

- `.env.local` é arquivo local e não deve ser versionado.
- `.env.example` pode expor apenas nomes de variáveis vazias.
- OpenAI, Stripe, Resend, Supabase secret/service role e webhooks são server-only.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são os únicos valores Supabase públicos aceitos.
