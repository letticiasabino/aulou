"use client";

import * as React from "react";
import { AlertTriangle, Bell, Check, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { calendarService } from "@/services/calendar.service";
import { notificationService } from "@/services/notification.service";
import { planningService } from "@/services/planning.service";
import type { AcademicNotification } from "@/types/academic";

const severityLabel = {
  low: "Baixo",
  moderate: "Moderado",
  high: "Alto",
  critical: "Crítico",
} as const;

export function NotificationsWorkspace() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = React.useState<AcademicNotification[]>([]);
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
      setNotifications(await notificationService.refresh(user.id, events, plan?.tasks ?? []));
    } catch (unknownError) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Não foi possível carregar as notificações.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);
  React.useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  async function markRead(id: string) {
    if (!user) return;
    await notificationService.markRead(user.id, id);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, readAt: new Date().toISOString() }
          : notification,
      ),
    );
  }
  if (!user)
    return (
      <EmptyState
        icon={Bell}
        title="Sessão necessária"
        description="Entre na sua conta para receber alertas acadêmicos."
        actionLabel="Entrar"
        actionHref="/login"
      />
    );
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Central de atenção</p>
          <h1 className="text-2xl font-semibold">Notificações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prazos, tarefas atrasadas e sinais importantes do seu semestre.
          </p>
        </div>
        <Button variant="ghost" onClick={() => void load()} disabled={loading}>
          <RefreshCw /> Atualizar
        </Button>
      </div>
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="grid gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : notifications.length ? (
        <div className="grid gap-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.readAt ? "opacity-65" : "border-primary/30"}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-1 size-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">{notification.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    notification.severity === "high" || notification.severity === "critical"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {severityLabel[notification.severity]}
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0">
                <span className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(notification.scheduledFor))}
                </span>
                {!notification.readAt ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void markRead(notification.id)}
                  >
                    <Check /> Marcar como lida
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Lida</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="Tudo em dia"
          description="Ainda não há alertas para você. Continue acompanhando sua agenda e seu plano."
        />
      )}
    </div>
  );
}
