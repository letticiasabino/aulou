"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { PLAN_DEFINITIONS } from "@/config/plans";
import { formatPlanPrice } from "@/engines/monetization-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BillingCycle, PlanCode } from "@/types/academic";

const order: PlanCode[] = ["free", "plus", "pro"];

export function PricingTable({
  billingCycle = "monthly",
  currentPlan,
}: {
  billingCycle?: BillingCycle;
  currentPlan?: PlanCode;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {order.map((code) => {
        const plan = PLAN_DEFINITIONS[code];
        const featured = code === "plus";
        return (
          <Card key={code} className={featured ? "border-primary shadow-lg shadow-primary/10" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{plan.name}</CardTitle>
                {featured ? (
                  <Badge>
                    <Sparkles /> Mais escolhido
                  </Badge>
                ) : null}
              </div>
              <CardDescription>
                {code === "free"
                  ? "Para começar a organizar o semestre."
                  : code === "plus"
                    ? "Para estudar com consistência e mais contexto."
                    : "Para quem quer extrair o máximo da IA."}
              </CardDescription>
              <div className="pt-3">
                <span className="text-3xl font-semibold">
                  {formatPlanPrice(code, billingCycle)}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{billingCycle === "yearly" ? "ano" : "mês"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <ul className="grid gap-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="grid gap-2 border-t pt-4 text-xs text-muted-foreground">
                <span>{plan.limits.uploadsPerMonth} uploads/mês</span>
                <span>{plan.limits.aiCreditsPerMonth} créditos de IA/mês</span>
                <span>{plan.limits.flashcardsPerMonth} flashcards/mês</span>
                <span>{plan.limits.quizzesPerMonth} quizzes/mês</span>
              </div>
            </CardContent>
            <CardFooter>
              {currentPlan === code ? (
                <Button className="w-full" variant="secondary" disabled>
                  Plano atual
                </Button>
              ) : (
                <Button asChild className="w-full" variant={featured ? "default" : "outline"}>
                  <Link href={currentPlan ? "/subscription" : `/register?plan=${code}`}>
                    {code === "free" ? "Começar grátis" : "Escolher plano"}
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
