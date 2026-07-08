import type { AcademicEvent, ExtractedAcademicEvent } from "@/types/academic";

export interface EventConflict {
  eventId: string;
  conflictingEventId: string;
  reason: "time_overlap";
}

function toTime(value: string | null) {
  return value ? new Date(value).getTime() : null;
}

export function detectConflicts(events: AcademicEvent[], candidate: ExtractedAcademicEvent): EventConflict[] {
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

export function confirmAcademicEvent(event: ExtractedAcademicEvent, userId: string, confirmedAt = new Date().toISOString()): AcademicEvent {
  return {
    ...event,
    userId,
    reviewStatus: "confirmed",
    confirmedAt,
  };
}
