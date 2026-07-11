"use client";

import * as React from "react";
import { CalendarDays, CheckCircle2, Clock3, Edit3, Plus, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { calendarService, type ManualEventInput } from "@/services/calendar.service";
import type { AcademicEvent } from "@/types/academic";
import type { AcademicEventFilters, AcademicEventRecord } from "@/types/academic-event-record";

const eventTypes: Array<{ value: AcademicEvent["eventType"]; label: string }> = [
  { value: "exam", label: "Prova" },
  { value: "assignment", label: "Trabalho" },
  { value: "class", label: "Aula" },
  { value: "forum", label: "Fórum" },
  { value: "reading", label: "Leitura" },
  { value: "study", label: "Estudo" },
  { value: "other", label: "Outro" },
];

function formatDate(value: string | null) {
  if (!value) return "Data a revisar";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function formatTime(event: AcademicEvent) {
  if (event.isAllDay || !event.startsAt) return "Dia inteiro";
  return new Intl.DateTimeFormat("pt-BR", {
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(event.startsAt));
}

function eventTypeLabel(type: AcademicEvent["eventType"]) {
  return eventTypes.find((item) => item.value === type)?.label ?? "Outro";
}

export function AcademicCalendar() {
  const { user } = useAuthContext();
  const currentUserId = user?.id ?? "";
  const [events, setEvents] = React.useState<AcademicEventRecord[]>([]);
  const [subjectOptions, setSubjectOptions] = React.useState<string[]>([]);
  const [filters, setFilters] = React.useState<AcademicEventFilters>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editor, setEditor] = React.useState<AcademicEventRecord | "new" | null>(null);
  const [now] = React.useState(() => Date.now());

  const loadEvents = React.useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const allEvents = await calendarService.listEvents(currentUserId);
      setSubjectOptions([...new Set(allEvents.map((event) => event.subjectName))].sort());
      setEvents(await calendarService.listEvents(currentUserId, filters));
    } catch (unknownError) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Não foi possível carregar a agenda.",
      );
    } finally {
      setLoading(false);
    }
  }, [currentUserId, filters]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadEvents(), 0);
    return () => window.clearTimeout(timer);
  }, [loadEvents]);

  if (!user)
    return (
      <EmptyState
        icon={CalendarDays}
        title="Sessão necessária"
        description="Entre na sua conta para acessar sua agenda acadêmica."
        actionLabel="Entrar"
        actionHref="/login"
      />
    );
  const upcoming = events.filter(
    (event) => event.startsAt && new Date(event.startsAt).getTime() >= now,
  ).length;

  async function saveEvent(input: ManualEventInput) {
    try {
      if (editor === "new") {
        await calendarService.createManualEvent(currentUserId, input);
        toast.success("Evento criado na agenda.");
      } else if (editor) {
        await calendarService.updateEvent(currentUserId, { ...editor, ...input });
        toast.success("Evento atualizado.");
      }
      setEditor(null);
      await loadEvents();
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível salvar o evento.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Semestre em foco</p>
          <h1 className="text-2xl font-semibold tracking-tight">Sua agenda acadêmica</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Eventos confirmados, prazos e aulas organizados por prioridade.
          </p>
        </div>
        <Button onClick={() => setEditor("new")}>
          <Plus /> Novo evento
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Eventos no filtro" value={String(events.length)} />
        <Stat label="Próximos eventos" value={String(upcoming)} />
        <Stat
          label="Provas"
          value={String(events.filter((event) => event.eventType === "exam").length)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar agenda</CardTitle>
          <CardDescription>
            Combine disciplina, tipo e período para encontrar o que precisa.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="Disciplina"
            value={filters.subjectName ?? "all"}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                subjectName: value === "all" ? undefined : value,
              }))
            }
            options={[
              { value: "all", label: "Todas" },
              ...subjectOptions.map((subject) => ({ value: subject, label: subject })),
            ]}
          />
          <FilterSelect
            label="Tipo"
            value={filters.eventType ?? "all"}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                eventType: value === "all" ? undefined : (value as AcademicEvent["eventType"]),
              }))
            }
            options={[{ value: "all", label: "Todos" }, ...eventTypes]}
          />
          <DateFilter
            label="De"
            value={filters.from ?? ""}
            onChange={(value) =>
              setFilters((current) => ({ ...current, from: value || undefined }))
            }
          />
          <DateFilter
            label="Até"
            value={filters.to ?? ""}
            onChange={(value) => setFilters((current) => ({ ...current, to: value || undefined }))}
          />
        </CardContent>
      </Card>

      {loading ? (
        <CalendarLoading />
      ) : error ? (
        <EmptyState
          icon={X}
          title="Não foi possível carregar a agenda"
          description={error}
          actionLabel="Tentar novamente"
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum evento encontrado"
          description="Confirme eventos importados ou crie o primeiro evento manualmente."
          actionLabel="Criar evento"
        />
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onEdit={() => setEditor(event)} />
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        className="w-fit"
        onClick={() => void loadEvents()}
        disabled={loading}
      >
        <RefreshCw /> Atualizar agenda
      </Button>
      <EventEditorDialog event={editor} onClose={() => setEditor(null)} onSave={saveEvent} />
    </div>
  );
}

function EventCard({ event, onEdit }: { event: AcademicEventRecord; onEdit: () => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={event.eventType === "exam" ? "destructive" : "secondary"}>
              {eventTypeLabel(event.eventType)}
            </Badge>
            <span className="text-xs text-muted-foreground">{event.subjectName}</span>
          </div>
          <CardTitle className="mt-2 text-base">{event.title}</CardTitle>
          <CardDescription>{formatDate(event.startsAt)}</CardDescription>
        </div>
        <Button size="icon" variant="ghost" aria-label={`Editar ${event.title}`} onClick={onEdit}>
          <Edit3 />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Clock3 className="size-4" />
          {formatTime(event)}
        </span>
        <span className="inline-flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-500" />
          Confirmado
        </span>
        {event.weight !== null ? <span>Peso {event.weight}%</span> : null}
      </CardContent>
    </Card>
  );
}

function EventEditorDialog({
  event,
  onClose,
  onSave,
}: {
  event: AcademicEventRecord | "new" | null;
  onClose: () => void;
  onSave: (event: ManualEventInput) => Promise<void>;
}) {
  const [title, setTitle] = React.useState("");
  const [subjectName, setSubjectName] = React.useState("");
  const [eventType, setEventType] = React.useState<AcademicEvent["eventType"]>("other");
  const [startsAt, setStartsAt] = React.useState("");
  const [isAllDay, setIsAllDay] = React.useState(false);
  const [weight, setWeight] = React.useState("");

  React.useEffect(() => {
    if (!event) return;
    const timer = window.setTimeout(() => {
      if (event === "new") {
        setTitle("");
        setSubjectName("");
        setEventType("other");
        setStartsAt("");
        setIsAllDay(true);
        setWeight("");
        return;
      }
      setTitle(event.title);
      setSubjectName(event.subjectName);
      setEventType(event.eventType);
      setStartsAt(event.startsAt?.slice(0, 16) ?? "");
      setIsAllDay(event.isAllDay);
      setWeight(event.weight?.toString() ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [event]);

  return (
    <Dialog open={Boolean(event)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event === "new" ? "Novo evento" : "Editar evento"}</DialogTitle>
          <DialogDescription>Eventos salvos nesta tela já estão confirmados.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="event-title">Título</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(input) => setTitle(input.target.value)}
              placeholder="Prova de cálculo"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-subject">Disciplina</Label>
            <Input
              id="event-subject"
              value={subjectName}
              onChange={(input) => setSubjectName(input.target.value)}
              placeholder="Cálculo I"
            />
          </div>
          <FilterSelect
            label="Tipo"
            value={eventType}
            onChange={(value) => setEventType(value as AcademicEvent["eventType"])}
            options={eventTypes}
          />
          <div className="grid gap-2">
            <Label htmlFor="event-start">Data e horário</Label>
            <Input
              id="event-start"
              type="datetime-local"
              value={startsAt}
              onChange={(input) => {
                setStartsAt(input.target.value);
                setIsAllDay(!input.target.value);
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(input) => setIsAllDay(input.target.checked)}
            />{" "}
            Evento de dia inteiro
          </label>
          <div className="grid gap-2">
            <Label htmlFor="event-weight">Peso (opcional)</Label>
            <Input
              id="event-weight"
              type="number"
              min="0"
              max="100"
              value={weight}
              onChange={(input) => setWeight(input.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!title.trim() || !subjectName.trim()}
            onClick={() =>
              void onSave({
                title,
                subjectName,
                eventType,
                startsAt: startsAt ? new Date(startsAt).toISOString() : null,
                endsAt: null,
                isAllDay,
                weight: weight ? Number(weight) : null,
                description: undefined,
                evidence: undefined,
              })
            }
          >
            Salvar evento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DateFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={`filter-${label}`}>{label}</Label>
      <Input
        id={`filter-${label}`}
        type="date"
        value={value}
        onChange={(input) => onChange(input.target.value)}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
function CalendarLoading() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((item) => (
        <Card key={item}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
