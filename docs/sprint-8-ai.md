# Sprint 8 - IA Tutor e Resumos

## Entregas

- `AIContextEngine` com contexto limitado, fatos acadêmicos, arquivos e referências.
- Provider OpenAI server-side com Responses API e saída estruturada.
- `MockAIProvider` para desenvolvimento sem Supabase/IA disponível.
- Resumo acadêmico com informações extraídas, pontos principais, incertezas e recomendações.
- Tutor contextual com fatos, inferências, recomendações e lacunas de contexto.
- Validação Zod e rejeição de referências de arquivos desconhecidos.

## Limites conhecidos

PDF, imagem, DOCX e XLSX só serão resumidos quando houver texto extraído persistido. A chave OpenAI não é usada em testes nem exposta ao navegador.
