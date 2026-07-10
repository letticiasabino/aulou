"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImportFileResult } from "@/engines/import-engine";
import type { ExtractedAcademicEvent } from "@/types/academic";

const confidenceLabels = {
  needs_review: "Precisa revisar",
  probable: "Provável",
  high_confidence: "Alta confiança",
} as const;

function toDatetimeLocal(value: string | null) {
  return value ? value.slice(0, 16) : "";
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function ImportPreviewDialog({
  result,
  fileName,
  onClose,
  onConfirm,
}: {
  result: ImportFileResult | null;
  fileName: string;
  onClose: () => void;
  onConfirm: (events: ExtractedAcademicEvent[]) => void;
}) {
  const [events, setEvents] = React.useState<ExtractedAcademicEvent[]>([]);

  React.useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => setEvents(result.preview.events), 0);
    return () => window.clearTimeout(timer);
  }, [result]);

  function updateEvent(id: string, patch: Partial<ExtractedAcademicEvent>) {
    setEvents((current) =>
      current.map((event) => (event.id === id ? { ...event, ...patch } : event)),
    );
  }

  return (
    <Dialog open={Boolean(result)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSearch className="text-primary" /> Preview de importação
          </DialogTitle>
          <DialogDescription>
            {fileName}. Revise os dados antes de enviar qualquer evento para a agenda.
          </DialogDescription>
        </DialogHeader>

        {result?.message ? (
          <div className="flex gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <span>{result.message}</span>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Summary label="Eventos encontrados" value={String(result?.preview.summary.total ?? 0)} />
          <Summary
            label="Precisam revisar"
            value={String(result?.preview.summary.needsReview ?? 0)}
          />
          <Summary
            label="Possíveis duplicatas"
            value={String(result?.preview.summary.duplicates ?? 0)}
          />
        </div>

        {events.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nenhum evento foi inventado. Este arquivo ainda precisa de uma etapa de extração de
            texto.
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <EventEditor
                key={event.id}
                event={event}
                onChange={(patch) => updateEvent(event.id, patch)}
              />
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(events)} disabled={!events.length}>
            <CheckCircle2 /> Confirmar revisão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EventEditor({
  event,
  onChange,
}: {
  event: ExtractedAcademicEvent;
  onChange: (patch: Partial<ExtractedAcademicEvent>) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm">Evento extraído</CardTitle>
        <Badge variant={event.confidenceLabel === "needs_review" ? "destructive" : "secondary"}>
          {confidenceLabels[event.confidenceLabel]} · {event.confidenceScore}%
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${event.id}-title`}>Título</Label>
          <Input
            id={`${event.id}-title`}
            value={event.title}
            onChange={(input) => onChange({ title: input.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${event.id}-subject`}>Disciplina</Label>
          <Input
            id={`${event.id}-subject`}
            value={event.subjectName}
            onChange={(input) => onChange({ subjectName: input.target.value || "Sem disciplina" })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${event.id}-date`}>Data e horário</Label>
          <Input
            id={`${event.id}-date`}
            type="datetime-local"
            value={toDatetimeLocal(event.startsAt)}
            onChange={(input) =>
              onChange({ startsAt: toIso(input.target.value), isAllDay: !input.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            {event.isAllDay ? "Evento de dia inteiro" : "Horário identificado no arquivo"}
          </p>
        </div>
        <div className="grid gap-2">
          <Label>Tipo e evidência</Label>
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p className="font-medium">{event.eventType}</p>
            <p className="mt-1 text-muted-foreground">
              {event.evidence ?? "Sem trecho de evidência."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
