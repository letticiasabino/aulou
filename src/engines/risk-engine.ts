import type { AcademicEvent, AcademicRisk, RiskLevel, StudyTask } from "@/types/academic";

export interface RiskEngineInput {
  events: AcademicEvent[];
  tasks?: StudyTask[];
  now?: Date;
  horizonDays?: number;
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function riskLevel(score: number): RiskLevel {
  if (score >= 80) return "low";
  if (score >= 60) return "moderate";
  if (score >= 35) return "high";
  return "critical";
}

export function calculateAcademicRisk({
  events,
  tasks = [],
  now = new Date(),
  horizonDays = 7,
}: RiskEngineInput): AcademicRisk {
  const nowTime = now.getTime();
  const horizonTime = nowTime + horizonDays * 24 * 60 * 60 * 1000;
  const overdueEvents = events.filter(
    (event) => event.startsAt && new Date(event.startsAt).getTime() < nowTime,
  );
  const overdueTasks = tasks.filter(
    (task) => task.status === "todo" && task.dueAt && new Date(task.dueAt).getTime() < nowTime,
  );
  const upcomingAssessments = events.filter((event) => {
    if (!event.startsAt || !["exam", "assignment", "forum"].includes(event.eventType)) return false;
    const time = new Date(event.startsAt).getTime();
    return time >= nowTime && time <= horizonTime;
  });
  const dateCounts = new Map<string, number>();
  for (const event of [...events, ...tasks.map((task) => ({ startsAt: task.dueAt }))]) {
    if (!event.startsAt) continue;
    const key = dateKey(new Date(event.startsAt));
    dateCounts.set(key, (dateCounts.get(key) ?? 0) + 1);
  }
  const busiestDay = [...dateCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const busiest = busiestDay ? { date: busiestDay[0], count: busiestDay[1] } : null;
  const score = Math.max(
    0,
    Math.min(
      100,
      100 -
        overdueEvents.length * 12 -
        overdueTasks.length * 8 -
        upcomingAssessments.filter(
          (event) =>
            event.startsAt &&
            new Date(event.startsAt).getTime() - nowTime <= 3 * 24 * 60 * 60 * 1000,
        ).length *
          8 -
        Math.max(0, (busiest?.count ?? 0) - 2) * 5,
    ),
  );
  const reasons: string[] = [];
  if (overdueEvents.length) reasons.push(`${overdueEvents.length} evento(s) vencido(s)`);
  if (overdueTasks.length) reasons.push(`${overdueTasks.length} tarefa(s) atrasada(s)`);
  if (upcomingAssessments.length)
    reasons.push(`${upcomingAssessments.length} avaliação(ões) nos próximos ${horizonDays} dias`);
  if (busiest && busiest.count > 2)
    reasons.push(`${busiest.count} compromissos concentrados em ${busiest.date}`);
  const recommendations = [
    ...(overdueTasks.length
      ? ["Reagende as tarefas atrasadas antes de adicionar novas sessões."]
      : []),
    ...(upcomingAssessments.length
      ? ["Priorize provas e trabalhos mais próximos no seu plano."]
      : []),
    ...(busiest && busiest.count > 2
      ? ["Distribua as atividades do dia mais carregado ao longo da semana."]
      : []),
  ];
  if (!recommendations.length)
    recommendations.push("Mantenha uma revisão curta diária para preservar o ritmo.");
  return {
    score,
    level: riskLevel(score),
    overdueEvents: overdueEvents.length,
    overdueTasks: overdueTasks.length,
    upcomingAssessments: upcomingAssessments.length,
    busiestDay: busiest,
    reasons,
    recommendations,
  };
}

export function calculateAcademicHealthScore(events: AcademicEvent[], now = new Date()) {
  return calculateAcademicRisk({ events, now }).score;
}
