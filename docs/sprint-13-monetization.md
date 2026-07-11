# Sprint 13 — Monetização

## Entrega

- Planos Free, Plus e Pro com preços e limites tipados.
- `MonetizationEngine` centraliza acesso, limites, preços e upgrade progressivo.
- `/pricing` apresenta os planos publicamente.
- `/subscription` apresenta plano atual, uso mensal, upgrade e checkout mockado.
- `PremiumGate` cria bloqueios premium com benefício e CTA contextual.
- `paymentService` está preparado para Stripe ou Mercado Pago, usando provider `mock` neste ciclo.

## Segurança e produção

O estado local é apenas uma camada de desenvolvimento. Em produção, limites e acesso devem ser revalidados server-side, e pagamentos reais devem alterar a assinatura somente após webhook verificado do provedor.

## Critérios de aceite

- [x] Free, Plus e Pro configurados.
- [x] Limites por plano centralizados.
- [x] Pricing público.
- [x] Tela de assinatura.
- [x] Bloqueio premium reutilizável.
- [x] Checkout mockado com ciclo mensal/anual.
- [x] Testes de limites e checkout.
