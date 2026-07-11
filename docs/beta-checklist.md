# Checklist do beta fechado

## Configuração

- [ ] Domínio e `NEXT_PUBLIC_SITE_URL` configurados.
- [ ] Supabase Production configurado com Auth, migrations, RLS e Storage privado.
- [ ] OpenAI configurada ou mock explicitamente aceito para o grupo piloto.
- [ ] E-mail transacional configurado ou fluxo de recuperação desativado para o piloto.
- [ ] Monitoramento de `/api/health` configurado.
- [ ] Backup e política de retenção definidos.

## Produto

- [ ] Criar conta e concluir onboarding.
- [ ] Cadastrar disciplina e professor.
- [ ] Enviar cronograma permitido e revisar eventos.
- [ ] Confirmar eventos e verificar agenda.
- [ ] Testar plano, flashcards, tutor, notificações e saúde acadêmica.
- [ ] Validar pricing, checkout mockado e bloqueios premium.
- [ ] Enviar feedback em `/feedback`.

## Segurança

- [ ] Nenhuma chave aparece no bundle ou no repositório.
- [ ] RLS testado para dois usuários distintos.
- [ ] Rate limit e headers de segurança confirmados.
- [ ] Logs não contêm material acadêmico nem respostas completas da IA.
- [ ] Termos e privacidade publicados antes do convite.

## Go / No-go

O beta só deve ser aberto quando os itens de configuração, segurança e smoke test estiverem concluídos. O modo local-first é adequado para desenvolvimento e demonstração, mas não deve ser confundido com persistência de produção.
