import type { AcademicEvent } from "@/types/academic";

export function buildReminderSchedule(event: AcademicEvent) {
  if (!event.startsAt) {
    return [];
  }

  const start = new Date(event.startsAt);
  const oneDayBefore = new Date(start);
  oneDayBefore.setDate(start.getDate() - 1);

  const oneHourBefore = new Date(start);
  oneHourBefore.setHours(start.getHours() - 1);

  return event.isAllDay ? [oneDayBefore.toISOString()] : [oneDayBefore.toISOString(), oneHourBefore.toISOString()];
}
