# Segurança

## Requisitos desde o início

- Validação de inputs com Zod.
- Sanitização de texto vindo de arquivos.
- Rate limit por usuário e por IP.
- Limites de upload por plano.
- Storage privado para arquivos.
- RLS em tabelas do Supabase.
- Variáveis de ambiente fora do Git.
- Logs sem chaves, tokens ou conteúdo sensível integral.
- Tratamento seguro de erros.
- Consentimento explícito para processar arquivos com IA.
- Termos de uso e política de privacidade públicos.

## Supabase

- Não expor `service_role` no cliente.
- Não usar `user_metadata` para autorização.
- Usar `to authenticated` + predicado por `user_id` em políticas.
- UPDATE precisa de `using` e `with check`.
- Views devem usar `security_invoker = true` quando expostas.

## IA e arquivos

- Arquivos são privados por padrão.
- Conteúdo enviado à IA deve ser minimizado ao necessário.
- Referências devem usar IDs internos e metadados seguros.
- O usuário deve poder excluir arquivos e dados associados.

## Sprint 1

- Middleware protege rotas privadas.
- Headers de segurança são definidos no `next.config.ts`.
- Env validation diferencia variáveis server-only e public.
- Rate limit inicial fica preparado por adapter em memória para desenvolvimento.
- Auth usa Supabase SSR com cookies e sessão persistente.

## Sprint 2

- Dados acadêmicos passam por schemas Zod antes de salvar.
- Fallback local usa `localStorage` apenas para desenvolvimento sem Supabase configurado.
- Nenhuma decisão de autorização usa `user_metadata`.
- Contrato de RLS exige `user_id` em `profiles`, `courses`, `semesters`, `teachers` e `subjects`.
- Logs e toasts exibem erros de domínio seguros, sem despejar payloads completos.
