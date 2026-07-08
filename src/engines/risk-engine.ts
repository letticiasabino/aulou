import type { AcademicEvent } from "@/types/academic";

export function calculateAcademicHealthScore(events: AcademicEvent[], now = new Date()) {
  const nowTime = now.getTime();
  const overdue = events.filter((event) => event.startsAt && new Date(event.startsAt).getTime() < nowTime).length;
  const highPriority = events.filter((event) => event.priority === "high" || event.priority === "maximum").length;
  const penalty = overdue * 12 + highPriority * 4;

  return Math.max(0, Math.min(100, 100 - penalty));
}
