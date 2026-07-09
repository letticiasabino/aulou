import {
  extractedAcademicEventInputSchema,
  type ExtractedAcademicEventInput,
  type ParsedExtractedAcademicEventInput,
} from "@/schemas/academic-event";
import type { AcademicPriority, ConfidenceLabel, ExtractedAcademicEvent } from "@/types/academic";

function stableId(prefix: string, value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return `${prefix}_${hash.toString(16).padStart(8, "0")}`;
}

export function labelConfidence(score: number): ConfidenceLabel {
  if (score >= 95) {
    return "high_confidence";
  }

  if (score >= 80) {
    return "probable";
  }

  return "needs_review";
}

export function priorityForEvent(
  eventType: ParsedExtractedAcademicEventInput["eventType"],
): AcademicPriority {
  if (eventType === "exam") {
    return "maximum";
  }

  if (eventType === "assignment" || eventType === "forum") {
    return "high";
  }

  if (eventType === "class" || eventType === "study") {
    return "medium";
  }

  return "low";
}

export function buildDedupeKey(
  input: Pick<ExtractedAcademicEventInput, "title" | "subjectName" | "eventType" | "startsAt">,
) {
  return [
    input.subjectName || "Sem disciplina",
    input.eventType,
    input.startsAt ?? "ambiguous-date",
    input.title,
  ]
    .join("|")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeExtractedEvent(
  rawEvent: ExtractedAcademicEventInput,
): ExtractedAcademicEvent {
  const parsed = extractedAcademicEventInputSchema.parse(rawEvent);
  const subjectName = parsed.subjectName || "Sem disciplina";
  const confidenceLabel = labelConfidence(parsed.confidenceScore);
  const reviewReasons = [...parsed.reviewReasons];

  if (!parsed.startsAt) {
    reviewReasons.push("Data ausente ou ambígua.");
  }

  if (subjectName === "Sem disciplina") {
    reviewReasons.push("Disciplina não identificada.");
  }

  if (confidenceLabel === "needs_review") {
    reviewReasons.push("Confiança abaixo de 80%.");
  }

  const normalized = {
    ...parsed,
    id: parsed.id ?? stableId("evt", JSON.stringify(parsed)),
    subjectName,
    endsAt: parsed.endsAt ?? null,
    isAllDay: parsed.isAllDay ?? !parsed.endsAt,
    weight: parsed.weight ?? null,
    confidenceLabel,
    reviewStatus: "pending_review" as const,
    priority: priorityForEvent(parsed.eventType),
    reviewReasons: [...new Set(reviewReasons)],
    dedupeKey: buildDedupeKey({
      title: parsed.title,
      subjectName,
      eventType: parsed.eventType,
      startsAt: parsed.startsAt,
    }),
  };

  return normalized;
}

export function createImportPreview(rawEvents: ExtractedAcademicEventInput[]) {
  const events = rawEvents.map(normalizeExtractedEvent);
  const duplicates = new Set<string>();
  const seen = new Set<string>();

  for (const event of events) {
    if (seen.has(event.dedupeKey)) {
      duplicates.add(event.dedupeKey);
    }

    seen.add(event.dedupeKey);
  }

  return {
    events: events.map((event) => ({
      ...event,
      reviewReasons: duplicates.has(event.dedupeKey)
        ? [...new Set([...event.reviewReasons, "Possível duplicidade na importação."])]
        : event.reviewReasons,
    })),
    summary: {
      total: events.length,
      needsReview: events.filter((event) => event.confidenceLabel === "needs_review").length,
      duplicates: duplicates.size,
    },
  };
}
