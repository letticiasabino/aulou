"use client";

import * as React from "react";
import { Activity, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { calendarService } from "@/services/calendar.service";
import { planningService } from "@/services/planning.service";
import { calculateAcademicRisk } from "@/engines/risk-engine";
import type { AcademicRisk } from "@/types/academic";

const labels = {
  low: "Baixo risco",
  moderate: "Atenção",
  high: "Alto risco",
  critical: "Risco crítico",
} as const;
export function ProgressWorkspace() {
  const { user } = useAuthContext();
  const [risk, setRisk] = React.useState<AcademicRisk | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [events, plan] = await Promise.all([
        calendarService.listEvents(user.id),
        planningService.latest(user.id),
      ]);
      setRisk(calculateAcademicRisk({ events, tasks: plan?.tasks ?? [] }));
    } catch (unknownError) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Não foi possível calcular seu risco.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);
  React.useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  if (!user)
    return (
      <EmptyState
        icon={Activity}
        title="Sessão necessária"
        description="Entre na sua conta para acompanhar sua saúde acadêmica."
        actionLabel="Entrar"
        actionHref="/login"
      />
    );
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">RiskEngine</p>
          <h1 className="text-2xl font-semibold">Saúde acadêmica</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Uma leitura dos seus prazos, atrasos e concentração de avaliações.
          </p>
        </div>
        <Button variant="ghost" onClick={() => void load()} disabled={loading}>
          <RefreshCw /> Recalcular
        </Button>
      </div>
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : risk ? (
        <>
          <Card className="border-primary/30">
            <CardContent className="grid gap-5 p-6 md:grid-cols-[180px_1fr] md:items-center">
              <div className="flex size-40 flex-col items-center justify-center rounded-full border-8 border-primary/30 bg-primary/10">
                <strong className="text-5xl">{risk.score}</strong>
                <span className="text-xs text-muted-foreground">de 100</span>
              </div>
              <div>
                <Badge
                  variant={
                    risk.level === "high" || risk.level === "critical" ? "destructive" : "secondary"
                  }
                >
                  {labels[risk.level]}
                </Badge>
                <h2 className="mt-3 text-xl font-semibold">
                  Seu semestre está {risk.level === "low" ? "sob controle" : "pedindo atenção"}.
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Score baseado em prazos vencidos, tarefas atrasadas, avaliações próximas e dias
                  sobrecarregados.
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Eventos vencidos" value={risk.overdueEvents} />
            <Metric label="Tarefas atrasadas" value={risk.overdueTasks} />
            <Metric label="Avaliações próximas" value={risk.upcomingAssessments} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Insight
              title="O que pesa no score"
              icon={AlertTriangle}
              items={risk.reasons.length ? risk.reasons : ["Nenhum fator de risco identificado."]}
            />
            <Insight title="Próximas ações" icon={CheckCircle2} items={risk.recommendations} />
          </div>
        </>
      ) : null}
    </div>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
function Insight({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof AlertTriangle;
  items: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 text-sm">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
