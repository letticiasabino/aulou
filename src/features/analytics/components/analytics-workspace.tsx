"use client";

import * as React from "react";
import { Activity, BarChart3, RefreshCw } from "lucide-react";
import { analyticsEngine } from "@/engines/analytics-engine";
import { getStoredAnalyticsEvents } from "@/services/analytics.service";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsWorkspace() {
  const { user } = useAuthContext();
  const [events, setEvents] = React.useState<ReturnType<typeof getStoredAnalyticsEvents>>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setEvents(user ? getStoredAnalyticsEvents(user.id) : []);
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);
  if (!user)
    return (
      <EmptyState
        icon={Activity}
        title="Sessão necessária"
        description="Entre na sua conta para acompanhar o funil do produto."
        actionLabel="Entrar"
        actionHref="/login"
      />
    );
  const funnel = analyticsEngine.buildFunnel(events);
  const uniqueUsers = new Set(events.map((event) => event.userId).filter(Boolean)).size;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Growth analytics</p>
          <h1 className="text-2xl font-semibold">Funil de conversão</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Eventos de ativação, uso e monetização deste ambiente.
          </p>
        </div>
        <Button variant="ghost" onClick={() => setEvents(getStoredAnalyticsEvents(user.id))}>
          <RefreshCw /> Atualizar
        </Button>
      </div>
      {loading ? (
        <div className="grid gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Usuários identificados" value={uniqueUsers} />
            <Metric label="Eventos registrados" value={events.length} />
            <Metric label="Etapas do funil" value={funnel.length} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="text-primary" /> Jornada principal
              </CardTitle>
              <CardDescription>
                Conversão de usuários únicos entre as etapas do produto.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {funnel.map((stage, index) => (
                <div
                  key={stage.name}
                  className="grid gap-2 sm:grid-cols-[1fr_auto_100px] sm:items-center"
                >
                  <span className="text-sm">
                    {index + 1}. {stage.name.replaceAll("_", " ")}
                  </span>
                  <Badge variant={stage.users ? "default" : "secondary"}>
                    {stage.users} usuários
                  </Badge>
                  <span className="text-right text-xs text-muted-foreground">
                    {index ? `${stage.conversionFromPrevious}% da etapa anterior` : "Base"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Eventos recentes</CardTitle>
              <CardDescription>Sem conteúdo de arquivos, mensagens ou credenciais.</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length ? (
                <div className="grid gap-2">
                  {events
                    .slice(-10)
                    .reverse()
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between gap-4 rounded-md border p-3"
                      >
                        <span className="text-sm">{event.name.replaceAll("_", " ")}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(new Date(event.occurredAt))}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum evento registrado para esta conta ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
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
