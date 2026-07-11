import type {
  AcademicEvent,
  AcademicPriority,
  StudyDay,
  StudyPlan,
  StudyTask,
} from "@/types/academic";

export interface PlanningInput {
  events: AcademicEvent[];
  availableMinutesPerDay: number;
  availabilityByWeekday?: Partial<Record<number, number>>;
  difficultyBySubject?: Record<string, 1 | 2 | 3 | 4 | 5>;
  startDate?: string;
  horizonDays?: number;
  existingTasks?: StudyTask[];
  now?: Date;
  userId?: string;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function priorityScore(priority: AcademicPriority) {
  return { maximum: 4, high: 3, medium: 2, low: 1 }[priority];
}

function minutesForEvent(event: AcademicEvent, difficulty: number) {
  const weightMultiplier = event.weight ? Math.max(1, event.weight / 20) : 1;
  const typeMultiplier = event.eventType === "exam" ? 1.25 : 1;
  return Math.min(
    240,
    Math.max(30, Math.ceil(30 * difficulty * weightMultiplier * typeMultiplier)),
  );
}

function taskForEvent(event: AcademicEvent, difficulty: number, index: number): StudyTask {
  const dueAt = event.startsAt ?? event.confirmedAt;
  return {
    id: `task_${event.id}_${index + 1}`,
    eventId: event.id,
    title: `Estudar para ${event.title}${index ? ` - sessão ${index + 1}` : ""}`,
    dueAt,
    estimatedMinutes: 0,
    priority: event.priority,
    status: "todo",
    subjectName: event.subjectName,
    eventType: event.eventType,
  };
}

function daysBetween(start: Date, end: Date) {
  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

function availabilityFor(date: Date, input: PlanningInput) {
  return Math.max(
    0,
    input.availabilityByWeekday?.[date.getUTCDay()] ?? input.availableMinutesPerDay,
  );
}

export function generateStudyPlan(input: PlanningInput): StudyPlan {
  const now = input.now ?? new Date();
  const start =
    parseDate(input.startDate) ??
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const horizonDays = Math.max(1, Math.min(31, input.horizonDays ?? 7));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + horizonDays - 1);
  const availableDays = daysBetween(start, end);
  const days: StudyDay[] = availableDays.map((date) => ({
    date: dateKey(date),
    availableMinutes: availabilityFor(date, input),
    plannedMinutes: 0,
    tasks: [],
  }));
  const candidates = input.events
    .filter((event) => ["exam", "assignment", "forum"].includes(event.eventType))
    .map((event) => ({
      event,
      difficulty: input.difficultyBySubject?.[event.subjectName] ?? 3,
      due: parseDate(event.startsAt),
    }))
    .sort((left, right) => {
      const leftDue = left.due?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightDue = right.due?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return (
        leftDue - rightDue ||
        priorityScore(right.event.priority) - priorityScore(left.event.priority) ||
        right.difficulty - left.difficulty
      );
    });

  let unscheduledMinutes = 0;
  for (const candidate of candidates) {
    const totalMinutes = minutesForEvent(candidate.event, candidate.difficulty);
    const dueKey = candidate.due ? dateKey(candidate.due) : dateKey(start);
    const eligibleDays = days.filter(
      (day) => day.date <= dueKey && day.availableMinutes > day.plannedMinutes,
    );
    const scheduleDays = eligibleDays.length ? eligibleDays : [days[0]].filter(Boolean);
    let remaining = totalMinutes;
    let sessionIndex = 0;
    for (const day of scheduleDays) {
      if (remaining <= 0) break;
      const capacity = Math.min(remaining, day.availableMinutes - day.plannedMinutes, 60);
      if (capacity <= 0) continue;
      const task = taskForEvent(candidate.event, candidate.difficulty, sessionIndex);
      task.estimatedMinutes = capacity;
      task.scheduledFor = day.date;
      day.tasks.push(task);
      day.plannedMinutes += capacity;
      remaining -= capacity;
      sessionIndex += 1;
    }
    if (remaining > 0) unscheduledMinutes += remaining;
  }

  const tasks = days.flatMap((day) => day.tasks);
  const timestamp = now.toISOString();
  return {
    id: `plan_${dateKey(start)}_${dateKey(end)}`,
    userId: input.userId ?? "",
    periodStart: dateKey(start),
    periodEnd: dateKey(end),
    availableMinutesPerDay: input.availableMinutesPerDay,
    availabilityByWeekday: input.availabilityByWeekday,
    tasks,
    days,
    unscheduledMinutes,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function replanOverdueTasks(plan: StudyPlan, now = new Date()): StudyPlan {
  const today = dateKey(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
  );
  const nextTasks = plan.tasks.map((task) =>
    task.status === "todo" && task.scheduledFor && task.scheduledFor < today
      ? { ...task, scheduledFor: today, overdue: true }
      : task,
  );
  const days = plan.days.map((day) => ({
    ...day,
    tasks: nextTasks.filter((task) => task.scheduledFor === day.date),
    plannedMinutes: nextTasks
      .filter((task) => task.scheduledFor === day.date)
      .reduce((total, task) => total + task.estimatedMinutes, 0),
  }));
  return { ...plan, tasks: nextTasks, days, updatedAt: now.toISOString() };
}

export function generateBasicStudyTasks(input: PlanningInput): StudyTask[] {
  return input.events
    .filter((event) => event.eventType === "exam" || event.eventType === "assignment")
    .sort((left, right) => (left.startsAt ?? "").localeCompare(right.startsAt ?? ""))
    .map((event) => {
      const difficulty = input.difficultyBySubject?.[event.subjectName] ?? 3;
      const weightMultiplier = event.weight ? Math.max(1, event.weight / 20) : 1;
      const estimatedMinutes = Math.ceil(
        Math.min(240, input.availableMinutesPerDay * difficulty * weightMultiplier),
      );
      return {
        id: `task_${event.id}`,
        eventId: event.id,
        title: `Estudar para ${event.title}`,
        dueAt: event.startsAt ?? event.confirmedAt,
        estimatedMinutes,
        priority: event.priority,
        status: "todo" as const,
        subjectName: event.subjectName,
        eventType: event.eventType,
      };
    });
}
