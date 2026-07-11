# Security Rules

## Sprint 10 - flashcards

- Conteúdo de cartões e histórico só podem ser lidos e alterados pelo próprio usuário.
- Geração automática não pode persistir conteúdo de outro usuário.
- O provider de geração não recebe chave secreta no cliente; o primeiro ciclo usa texto fornecido e fallback local.

## Sprint 9 - plano de estudos

- Planos e tarefas são filtrados por `user_id` no fallback e no repositório Supabase.
- O plano não cria eventos acadêmicos nem altera dados de outros usuários.
- Disponibilidade e dificuldade são preferências do usuário, não dados confiáveis para autorização.

## Sprint 8 - IA

- `OPENAI_API_KEY` e `OPENAI_MODEL` são server-only; nenhum componente client importa o provider OpenAI.
- Route Handlers montam contexto somente após `auth.getUser()` e filtram eventos, arquivos e extrações por `user_id`.
- Respostas externas são validadas com Zod antes de chegar à interface.
- Logs não registram prompts, material integral ou respostas integrais.

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

## Sprint 12 - notificacoes e risco

- O score academico e calculado localmente a partir de dados ja autorizados do usuario.
- Mensagens de notificacao nao incluem conteudo de arquivos ou dados sensiveis.

## Sprint 13 - monetizacao

- O navegador nao e fonte confiavel para liberar recursos pagos; limites reais devem ser revalidados no backend.
- Checkout real deve validar assinatura por webhook, nunca por retorno visual do cliente.

## Sprint 14 - analytics

- Eventos não podem conter conteúdo de arquivos, perguntas, respostas, senhas, tokens ou nomes de arquivos.
- Analytics não deve ser usado como fonte de autorização, cobrança ou decisão acadêmica.
