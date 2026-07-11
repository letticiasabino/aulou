import { isSupabaseConfigured } from "@/lib/supabase/client";
import { confirmAcademicEvent, filterAcademicEvents } from "@/engines/calendar-engine";
import { academicEventRecordSchema } from "@/schemas/academic-event-record";
import { supabaseCalendarRepository } from "@/services/calendar.supabase-repository";
import type { AcademicEvent, ExtractedAcademicEvent } from "@/types/academic";
import type { AcademicEventFilters, AcademicEventRecord } from "@/types/academic-event-record";

const localStorageKey = "aulou.academic-events";

function readLocal(userId: string) {
  if (typeof window === "undefined") return [];
  return (
    JSON.parse(window.localStorage.getItem(localStorageKey) ?? "[]") as AcademicEventRecord[]
  ).filter((event) => event.userId === userId && event.reviewStatus === "confirmed");
}

function writeLocal(events: AcademicEventRecord[]) {
  window.localStorage.setItem(localStorageKey, JSON.stringify(events));
}

export type ManualEventInput = Omit<
  ExtractedAcademicEvent,
  | "id"
  | "sourceFileId"
  | "confidenceScore"
  | "confidenceLabel"
  | "reviewStatus"
  | "priority"
  | "reviewReasons"
  | "dedupeKey"
>;

function createManualEvent(userId: string, event: ManualEventInput): AcademicEvent {
  const candidate = {
    ...event,
    id: crypto.randomUUID(),
    sourceFileId: "",
    confidenceScore: 100,
    confidenceLabel: "high_confidence" as const,
    reviewStatus: "pending_review" as const,
    priority: "medium" as const,
    reviewReasons: [],
    dedupeKey:
      `${event.subjectName}|${event.eventType}|${event.startsAt}|${event.title}`.toLowerCase(),
  };
  return confirmAcademicEvent(candidate, userId);
}

export const calendarService = {
  async listEvents(userId: string, filters: AcademicEventFilters = {}) {
    if (isSupabaseConfigured()) return supabaseCalendarRepository.list(userId, filters);
    return filterAcademicEvents(readLocal(userId), filters) as AcademicEventRecord[];
  },

  async confirmImportedEvents(userId: string, events: ExtractedAcademicEvent[]) {
    const confirmed = events.map((event) => confirmAcademicEvent(event, userId));
    if (isSupabaseConfigured()) {
      for (const event of confirmed) await supabaseCalendarRepository.create(userId, event);
      return confirmed;
    }
    const current = readLocal(userId);
    const next = [...current];
    for (const event of confirmed)
      if (!next.some((saved) => saved.dedupeKey === event.dedupeKey))
        next.push({ ...event, createdAt: event.confirmedAt, updatedAt: event.confirmedAt });
    writeLocal(next);
    return confirmed;
  },

  async createManualEvent(userId: string, event: ManualEventInput) {
    const created = createManualEvent(userId, event);
    academicEventRecordSchema.parse({
      ...created,
      sourceFileId: null,
      createdAt: created.confirmedAt,
      updatedAt: created.confirmedAt,
    });
    if (isSupabaseConfigured()) return supabaseCalendarRepository.create(userId, created);
    const record = { ...created, createdAt: created.confirmedAt, updatedAt: created.confirmedAt };
    writeLocal([...readLocal(userId), record]);
    return record;
  },

  async updateEvent(userId: string, event: AcademicEventRecord) {
    if (isSupabaseConfigured()) return supabaseCalendarRepository.update(userId, event.id, event);
    const next = readLocal(userId).map((saved) =>
      saved.id === event.id ? { ...event, updatedAt: new Date().toISOString() } : saved,
    );
    writeLocal(next);
    return next.find((saved) => saved.id === event.id) ?? event;
  },
};
