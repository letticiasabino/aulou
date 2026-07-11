import { createClient } from "@/lib/supabase/client";
import { academicEventRecordSchema } from "@/schemas/academic-event-record";
import type { AcademicEvent } from "@/types/academic";
import type { AcademicEventFilters, AcademicEventRecord } from "@/types/academic-event-record";
import type { AcademicEventRow } from "@/types/database.types";

function mapEvent(row: AcademicEventRow): AcademicEventRecord {
  return {
    id: row.id,
    userId: row.user_id,
    sourceFileId: row.source_file_id ?? "",
    title: row.title,
    description: row.description ?? undefined,
    subjectName: row.subject_name,
    eventType: row.event_type,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isAllDay: row.is_all_day,
    weight: row.weight,
    confidenceScore: row.confidence_score,
    confidenceLabel: row.confidence_label,
    reviewStatus: row.review_status,
    priority: row.priority,
    evidence: row.evidence ?? undefined,
    reviewReasons: row.review_reasons,
    dedupeKey: row.dedupe_key,
    confirmedAt: row.confirmed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assertResult(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

function withTimestamps(
  record: ReturnType<typeof academicEventRecordSchema.parse>,
): AcademicEventRecord {
  const timestamp = record.confirmedAt;
  return {
    ...record,
    sourceFileId: record.sourceFileId ?? "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const supabaseCalendarRepository = {
  async list(userId: string, filters: AcademicEventFilters = {}) {
    const supabase = createClient();
    let query = supabase
      .from("academic_events")
      .select("*")
      .eq("user_id", userId)
      .eq("review_status", "confirmed")
      .order("starts_at", { ascending: true, nullsFirst: false });
    if (filters.subjectName) query = query.eq("subject_name", filters.subjectName);
    if (filters.eventType) query = query.eq("event_type", filters.eventType);
    if (filters.from) query = query.gte("starts_at", `${filters.from}T00:00:00.000Z`);
    if (filters.to) query = query.lte("starts_at", `${filters.to}T23:59:59.999Z`);
    const result = await query;
    assertResult(result.error, "Não foi possível carregar a agenda.");
    return (result.data ?? []).map(mapEvent);
  },

  async create(userId: string, event: AcademicEvent) {
    const supabase = createClient();
    const record = academicEventRecordSchema.parse({
      ...event,
      sourceFileId: event.sourceFileId || null,
    });
    const result = await supabase.from("academic_events").insert({
      id: record.id,
      user_id: userId,
      source_file_id: record.sourceFileId,
      title: record.title,
      description: record.description ?? null,
      subject_name: record.subjectName,
      event_type: record.eventType,
      starts_at: record.startsAt,
      ends_at: record.endsAt,
      is_all_day: record.isAllDay,
      weight: record.weight,
      confidence_score: record.confidenceScore,
      confidence_label: record.confidenceLabel,
      review_status: record.reviewStatus,
      priority: record.priority,
      evidence: record.evidence ?? null,
      review_reasons: record.reviewReasons,
      dedupe_key: record.dedupeKey,
      confirmed_at: record.confirmedAt,
    });
    assertResult(result.error, "Não foi possível salvar o evento.");
    return withTimestamps(record);
  },

  async update(userId: string, eventId: string, event: AcademicEvent) {
    const supabase = createClient();
    const record = academicEventRecordSchema.parse({
      ...event,
      id: eventId,
      sourceFileId: event.sourceFileId || null,
    });
    const result = await supabase
      .from("academic_events")
      .update({
        title: record.title,
        description: record.description ?? null,
        subject_name: record.subjectName,
        event_type: record.eventType,
        starts_at: record.startsAt,
        ends_at: record.endsAt,
        is_all_day: record.isAllDay,
        weight: record.weight,
        dedupe_key: record.dedupeKey,
      })
      .eq("id", eventId)
      .eq("user_id", userId);
    assertResult(result.error, "Não foi possível atualizar o evento.");
    return withTimestamps(record);
  },
};
