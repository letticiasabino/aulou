"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ListChecks,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { calendarService } from "@/services/calendar.service";
import { planningService } from "@/services/planning.service";
import type { AcademicEvent, StudyPlan, StudyTask } from "@/types/academic";

const todayKey = () => new Date().toISOString().slice(0, 10);

function formatDay(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function PlannerWorkspace() {
  const { user } = useAuthContext();
  const userId = user?.id ?? "";
  const [events, setEvents] = React.useState<AcademicEvent[]>([]);
  const [plan, setPlan] = React.useState<StudyPlan | null>(null);
  const [availableMinutes, setAvailableMinutes] = React.useState("60");
  const [horizonDays, setHorizonDays] = React.useState("7");
  const [difficulty, setDifficulty] = React.useState<Record<string, string>>({});
  const [view, setView] = React.useState<"today" | "week">("week");
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [today] = React.useState(todayKey);

  const load = React.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [nextEvents, latestPlan] = await Promise.all([
        calendarService.listEvents(userId),
        planningService.latest(userId),
      ]);
      setEvents(nextEvents);
      setPlan(latestPlan);
      setDifficulty((current) => ({
        ...Object.fromEntries(
          nextEvents.map((event) => [event.subjectName, current[event.subjectName] ?? "3"]),
        ),
        ...current,
      }));
    } catch (unknownError) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Não foi possível carregar seu plano.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (!user)
    return (
      <EmptyState
        icon={ListChecks}
        title="Sessão necessária"
        description="Entre na sua conta para criar seu plano de estudos."
        actionLabel="Entrar"
        actionHref="/login"
      />
    );

  const subjects = [...new Set(events.map((event) => event.subjectName))].sort();

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const nextPlan = await planningService.create(userId, {
        events,
        availableMinutesPerDay: Number(availableMinutes),
        horizonDays: Number(horizonDays),
        difficultyBySubject: Object.fromEntries(
          Object.entries(difficulty).map(([subject, value]) => [subject, Number(value)]),
        ) as Record<string, 1 | 2 | 3 | 4 | 5>,
        startDate: today,
      });
      setPlan(nextPlan);
      toast.success("Plano de estudos atualizado.");
    } catch (unknownError) {
      setError(
        unknownError instanceof Error ? unknownError.message : "Não foi possível gerar o plano.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function toggleTask(task: StudyTask) {
    if (!plan) return;
    try {
      const nextPlan = await planningService.updateTask(
        userId,
        plan,
        task.id,
        task.status === "done" ? "todo" : "done",
      );
      setPlan(nextPlan);
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error
          ? unknownError.message
          : "Não foi possível atualizar a tarefa.",
      );
    }
  }

  const visibleDays = plan?.days.filter((day) => view === "week" || day.date === today) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">PlanningEngine</p>
          <h1 className="text-2xl font-semibold tracking-tight">Plano de estudos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Distribua o esforço antes das provas, respeitando seu tempo real.
          </p>
        </div>
        <Button variant="ghost" onClick={() => void load()} disabled={loading}>
          <RefreshCw /> Atualizar
        </Button>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Configurar novo plano
          </CardTitle>
          <CardDescription>
            Provas e trabalhos têm prioridade. A dificuldade aumenta o tempo recomendado por
            disciplina.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="available-minutes">Minutos disponíveis por dia</Label>
              <Input
                id="available-minutes"
                type="number"
                min="15"
                max="480"
                value={availableMinutes}
                onChange={(input) => setAvailableMinutes(input.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="horizon-days">Dias do plano</Label>
              <Input
                id="horizon-days"
                type="number"
                min="1"
                max="31"
                value={horizonDays}
                onChange={(input) => setHorizonDays(input.target.value)}
              />
            </div>
          </div>
          {subjects.length ? (
            <div className="grid gap-3">
              <Label>Dificuldade por disciplina</Label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                  <div
                    key={subject}
                    className="flex items-center justify-between gap-3 rounded-md border bg-background p-3"
                  >
                    <span className="truncate text-sm">{subject}</span>
                    <Select
                      value={difficulty[subject] ?? "3"}
                      onValueChange={(value) =>
                        setDifficulty((current) => ({ ...current, [subject]: value }))
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <SelectItem key={value} value={String(value)}>
                            {value} / 5
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Confirme eventos na agenda para personalizar o plano por disciplina.
            </p>
          )}
          <Button
            className="w-fit"
            onClick={() => void generate()}
            disabled={generating || !events.length}
          >
            {generating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {generating ? "Gerando plano..." : "Gerar plano"}
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      ) : null}
      {loading ? (
        <PlannerLoading />
      ) : plan ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Período" value={`${plan.periodStart} a ${plan.periodEnd}`} />
            <Stat label="Sessões" value={String(plan.tasks.length)} />
            <Stat
              label="Minutos planejados"
              value={String(plan.tasks.reduce((total, task) => total + task.estimatedMinutes, 0))}
            />
            <Stat label="Minutos pendentes" value={String(plan.unscheduledMinutes ?? 0)} />
          </div>
          {plan.unscheduledMinutes ? (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Há {plan.unscheduledMinutes} minutos de estudo além da capacidade configurada. Aumente
              o horizonte ou sua disponibilidade para cobrir tudo.
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button
              variant={view === "week" ? "default" : "outline"}
              onClick={() => setView("week")}
            >
              Semana
            </Button>
            <Button
              variant={view === "today" ? "default" : "outline"}
              onClick={() => setView("today")}
            >
              Hoje
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleDays.map((day) => (
              <DayCard key={day.date} day={day} onToggle={toggleTask} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="Nenhum plano criado"
          description="Confirme provas ou trabalhos na agenda e gere um plano personalizado."
        />
      )}
    </div>
  );
}

function DayCard({
  day,
  onToggle,
}: {
  day: StudyPlan["days"][number];
  onToggle: (task: StudyTask) => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="capitalize">{formatDay(day.date)}</CardTitle>
          <CardDescription>
            {day.plannedMinutes} de {day.availableMinutes} minutos planejados
          </CardDescription>
        </div>
        <Badge variant={day.plannedMinutes > day.availableMinutes ? "destructive" : "secondary"}>
          {day.tasks.length} sessões
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-2">
        {day.tasks.length ? (
          day.tasks.map((task) => <TaskRow key={task.id} task={task} onToggle={onToggle} />)
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            Dia livre ou sem capacidade disponível.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TaskRow({
  task,
  onToggle,
}: {
  task: StudyTask;
  onToggle: (task: StudyTask) => Promise<void>;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-md border p-3 ${task.status === "done" ? "bg-emerald-500/5" : "bg-background"}`}
    >
      <button
        type="button"
        className="shrink-0"
        onClick={() => void onToggle(task)}
        aria-label={task.status === "done" ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
      >
        {task.status === "done" ? (
          <CheckCircle2 className="text-emerald-500" />
        ) : (
          <span className="block size-5 rounded-full border-2 border-muted-foreground" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}
        >
          {task.title}
        </p>
        <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="size-3" />
          {task.estimatedMinutes} min · {task.subjectName}
        </p>
      </div>
      <Badge
        variant={
          task.overdue ? "destructive" : task.priority === "maximum" ? "destructive" : "outline"
        }
      >
        {task.overdue ? "Atrasada" : task.priority === "maximum" ? "Prova" : "Plano"}
      </Badge>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
function PlannerLoading() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[1, 2].map((item) => (
        <Card key={item}>
          <CardHeader>
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="grid gap-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
