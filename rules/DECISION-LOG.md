# Decision Log Rules

- Record irreversible architecture, security, hosting and provider decisions with date, reason and impact.
- Never record secrets, tokens or personal data.
- External blockers must be marked `BLOQUEADO POR ACESSO EXTERNO` with the exact next action.

## 2026-07-11 - Rebranding para Aulou

- Nome anterior: StudyPilot AI.
- Nome atual: Aulou.
- Motivo: consolidar a identidade brasileira e a marca oficial enviada.
- Impacto tecnico: pacote, metadata, PWA, textos visiveis, chaves de localStorage e testes foram atualizados; tabelas, colunas e migrations nao foram renomeadas.
- Identidade visual: laranja `#FF7A00`, azul-marinho `#14213D`, cinza claro `#F3F4F6` e branco `#FFFFFF`.
- Compatibilidade: dados persistidos no Supabase permanecem intactos; o fallback local passa a usar chaves Aulou para novas sessoes.

## 2026-07-11 - Hosting

- O app permanece um Next.js full-stack.
- Netlify e o destino preferencial do app web nesta fase.
- Supabase permanece como banco, Auth e Storage.
- Render fica preparado para um worker futuro; nenhum servico vazio foi publicado.
- Status: deploy e conexao dos provedores estao `BLOQUEADOS POR ACESSO EXTERNO`.
