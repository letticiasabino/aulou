import { calculateAcademicRisk } from "@/engines/risk-engine";
import type { AcademicEvent, AcademicNotification, StudyTask } from "@/types/academic";

export function buildNotifications({
  userId,
  events,
  tasks = [],
  now = new Date(),
}: {
  userId: string;
  events: AcademicEvent[];
  tasks?: StudyTask[];
  now?: Date;
}): AcademicNotification[] {
  const nowTime = now.getTime();
  const notifications: AcademicNotification[] = [];
  const add = (notification: Omit<AcademicNotification, "id" | "createdAt" | "userId">) => {
    notifications.push({
      ...notification,
      id: `${notification.type}:${notification.relatedEventId ?? notification.relatedTaskId ?? notification.scheduledFor}`,
      userId,
      createdAt: now.toISOString(),
    });
  };
  for (const event of events) {
    if (!event.startsAt) continue;
    const start = new Date(event.startsAt);
    const hours = (start.getTime() - nowTime) / 3_600_000;
    if (hours < 0) {
      add({
        type: "overdue",
        title: "Evento vencido",
        message: `${event.title} precisa de atenção.`,
        severity: "high",
        relatedEventId: event.id,
        scheduledFor: event.startsAt,
      });
    } else if (hours <= 72) {
      const type = event.eventType === "exam" ? "exam" : "deadline";
      add({
        type,
        title: type === "exam" ? "Prova se aproximando" : "Prazo se aproximando",
        message: `${event.title} acontece em breve.`,
        severity: event.eventType === "exam" ? "high" : "moderate",
        relatedEventId: event.id,
        scheduledFor: event.startsAt,
      });
    }
  }
  for (const task of tasks) {
    if (task.status === "todo" && new Date(task.dueAt).getTime() < nowTime) {
      add({
        type: "overdue",
        title: "Tarefa atrasada",
        message: `${task.title} está atrasada no seu plano.`,
        severity: "high",
        relatedTaskId: task.id,
        scheduledFor: task.dueAt,
      });
    }
  }
  const risk = calculateAcademicRisk({ events, tasks, now });
  if (risk.level === "high" || risk.level === "critical") {
    add({
      type: "risk",
      title: "Atenção ao seu semestre",
      message: risk.reasons.join(". ") || "Seu calendário pede uma reorganização.",
      severity: risk.level,
      scheduledFor: now.toISOString(),
    });
  }
  return notifications;
}

export function buildReminderSchedule(event: AcademicEvent) {
  if (!event.startsAt) {
    return [];
  }

  const start = new Date(event.startsAt);
  const oneDayBefore = new Date(start);
  oneDayBefore.setDate(start.getDate() - 1);

  const oneHourBefore = new Date(start);
  oneHourBefore.setHours(start.getHours() - 1);

  return event.isAllDay
    ? [oneDayBefore.toISOString()]
    : [oneDayBefore.toISOString(), oneHourBefore.toISOString()];
}
