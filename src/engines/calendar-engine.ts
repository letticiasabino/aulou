import type { AcademicEvent, ExtractedAcademicEvent } from "@/types/academic";
import type { AcademicEventFilters } from "@/types/academic-event-record";

export interface EventConflict {
  eventId: string;
  conflictingEventId: string;
  reason: "time_overlap";
}

function toTime(value: string | null) {
  return value ? new Date(value).getTime() : null;
}

export function detectConflicts(
  events: AcademicEvent[],
  candidate: ExtractedAcademicEvent,
): EventConflict[] {
  const candidateStart = toTime(candidate.startsAt);
  const candidateEnd = toTime(candidate.endsAt);

  if (!candidateStart || !candidateEnd || candidate.isAllDay) {
    return [];
  }

  return events
    .filter((event) => {
      const eventStart = toTime(event.startsAt);
      const eventEnd = toTime(event.endsAt);

      if (!eventStart || !eventEnd || event.isAllDay) {
        return false;
      }

      return candidateStart < eventEnd && eventStart < candidateEnd;
    })
    .map((event) => ({
      eventId: candidate.id,
      conflictingEventId: event.id,
      reason: "time_overlap" as const,
    }));
}

export function confirmAcademicEvent(
  event: ExtractedAcademicEvent,
  userId: string,
  confirmedAt = new Date().toISOString(),
): AcademicEvent {
  return {
    ...event,
    userId,
    reviewStatus: "confirmed",
    confirmedAt,
  };
}

export function filterAcademicEvents(events: AcademicEvent[], filters: AcademicEventFilters) {
  return events
    .filter((event) => !filters.subjectName || event.subjectName === filters.subjectName)
    .filter((event) => !filters.eventType || event.eventType === filters.eventType)
    .filter(
      (event) => !filters.from || !event.startsAt || event.startsAt.slice(0, 10) >= filters.from,
    )
    .filter((event) => !filters.to || !event.startsAt || event.startsAt.slice(0, 10) <= filters.to)
    .sort((first, second) => {
      if (!first.startsAt) return 1;
      if (!second.startsAt) return -1;
      return first.startsAt.localeCompare(second.startsAt);
    });
}
