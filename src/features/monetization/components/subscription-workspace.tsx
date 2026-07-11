"use client";

import * as React from "react";
import { Check, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { PLAN_DEFINITIONS } from "@/config/plans";
import { formatPlanPrice, getUsageState } from "@/engines/monetization-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { PremiumGate } from "@/features/monetization/components/premium-gate";
import { subscriptionService } from "@/services/subscription.service";
import type { BillingCycle, PlanCode, Subscription, UsageCounters } from "@/types/academic";

export function SubscriptionWorkspace() {
  const { user } = useAuthContext();
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [usage, setUsage] = React.useState<UsageCounters | null>(null);
  const [cycle, setCycle] = React.useState<BillingCycle>("monthly");
  const [selected, setSelected] = React.useState<PlanCode>("plus");
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!user) {
        setLoading(false);
        return;
      }
      void Promise.all([subscriptionService.get(user.id), subscriptionService.getUsage(user.id)])
        .then(([nextSubscription, nextUsage]) => {
          setSubscription(nextSubscription);
          setUsage(nextUsage);
        })
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);

  if (!user)
    return (
      <EmptyState
        icon={CreditCard}
        title="Sessão necessária"
        description="Entre na sua conta para gerenciar sua assinatura."
        actionLabel="Entrar"
        actionHref="/login"
      />
    );
  if (loading || !subscription || !usage)
    return (
      <div className="grid gap-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );

  const plan = PLAN_DEFINITIONS[subscription.plan];
  const userId = user.id;
  const usageState = getUsageState(subscription.plan, usage);
  async function checkout() {
    setProcessing(true);
    setMessage(null);
    try {
      const next = await subscriptionService.startCheckout(userId, selected, cycle);
      setSubscription(next);
      setMessage(
        `Plano ${PLAN_DEFINITIONS[next.plan].name} ativado com sucesso no checkout de demonstração.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível iniciar o checkout.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">MonetizationEngine</p>
        <h1 className="text-2xl font-semibold">Sua assinatura</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie seu plano e acompanhe o uso mensal.
        </p>
      </div>
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge>{plan.name}</Badge>
            <h2 className="mt-3 text-xl font-semibold">
              {subscription.plan === "free"
                ? "Você está no plano gratuito."
                : `Plano ${plan.name} ativo.`}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {subscription.plan === "free"
                ? "Desbloqueie mais contexto para organizar seu semestre."
                : `Próxima renovação: ${subscription.currentPeriodEndsAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(subscription.currentPeriodEndsAt)) : "não definida"}.`}
            </p>
          </div>
          <ShieldCheck className="size-10 text-primary" />
        </CardContent>
      </Card>
      {message ? (
        <div className="rounded-md border border-primary/30 bg-primary/10 p-4 text-sm">
          {message}
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Uso deste mês</CardTitle>
          <CardDescription>Os limites são renovados a cada período de cobrança.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(usageState).map(([key, state]) => (
            <div key={key} className="rounded-md border p-4">
              <p className="text-sm capitalize text-muted-foreground">
                {key === "aiCredits" ? "Créditos de IA" : key}
              </p>
              <p className="mt-1 font-semibold">
                {state.used}{" "}
                <span className="font-normal text-muted-foreground">/ {state.limit}</span>
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(100, (state.used / state.limit) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <PremiumGate plan={subscription.plan} feature="priorityProcessing">
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-medium">Processamento prioritário</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Seu cronograma entra na frente da fila no plano Pro.
              </p>
            </div>
            <Badge variant="secondary">Pro</Badge>
          </CardContent>
        </Card>
      </PremiumGate>
      <Card>
        <CardHeader>
          <CardTitle>Fazer upgrade</CardTitle>
          <CardDescription>
            Checkout de demonstração preparado para conectar um provedor real.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="subscription-plan" className="text-sm font-medium">
                Plano
              </label>
              <Select value={selected} onValueChange={(value) => setSelected(value as PlanCode)}>
                <SelectTrigger id="subscription-plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plus">Plus · {formatPlanPrice("plus", cycle)}</SelectItem>
                  <SelectItem value="pro">Pro · {formatPlanPrice("pro", cycle)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="billing-cycle" className="text-sm font-medium">
                Cobrança
              </label>
              <Select value={cycle} onValueChange={(value) => setCycle(value as BillingCycle)}>
                <SelectTrigger id="billing-cycle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual · 2 meses grátis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            {PLAN_DEFINITIONS[selected].features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <Check className="size-4 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            className="w-fit"
            onClick={() => void checkout()}
            disabled={processing || selected === subscription.plan}
          >
            {processing ? <Loader2 className="animate-spin" /> : <CreditCard />}
            {processing ? "Processando..." : "Continuar para checkout"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
