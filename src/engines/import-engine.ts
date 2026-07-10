import {
  extractedAcademicEventInputSchema,
  type ExtractedAcademicEventInput,
  type ParsedExtractedAcademicEventInput,
} from "@/schemas/academic-event";
import type { AcademicPriority, ConfidenceLabel, ExtractedAcademicEvent } from "@/types/academic";
import { validateAcademicFile } from "@/schemas/academic-file";

export type TextExtractionResult = {
  source: "file" | "mock";
  text: string;
  message?: string;
};

export type ImportFileResult = TextExtractionResult & {
  preview: ReturnType<typeof createImportPreview>;
};

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

export function validateImportPreviewEvents(events: ExtractedAcademicEvent[]) {
  return events.map((event) =>
    extractedAcademicEventInputSchema.parse({
      ...event,
      id: event.id,
    }),
  );
}

export async function extractTextFromFile(file: File): Promise<TextExtractionResult> {
  const validated = validateAcademicFile(file);

  if (validated.contentType === "text/plain" || validated.contentType === "text/csv") {
    return { source: "file", text: await file.text() };
  }

  return {
    source: "mock",
    text: "",
    message:
      "Este formato foi recebido, mas a extração de texto será conectada em uma próxima etapa.",
  };
}

function classifyEventType(value: string) {
  const normalized = value.toLowerCase();
  if (/prova|exame|avalia/.test(normalized)) return "exam" as const;
  if (/trabalho|entrega|projeto|atividade/.test(normalized)) return "assignment" as const;
  if (/fórum|forum|discuss/.test(normalized)) return "forum" as const;
  if (/aula|encontro|classe/.test(normalized)) return "class" as const;
  if (/leitura|capítulo|capitulo/.test(normalized)) return "reading" as const;
  return "other" as const;
}

function parseDate(value: string | undefined) {
  if (!value) return null;
  const match = value.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})|(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const day = match[1] ?? match[6];
  const month = match[2] ?? match[5];
  const rawYear = match[3] ?? match[4];
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
  const time = value.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${time ? `${time[1].padStart(2, "0")}:${time[2]}` : "00:00"}:00.000Z`;
}

function splitStructuredLine(line: string) {
  return line.includes(";")
    ? line.split(";").map((item) => item.trim())
    : line.split(",").map((item) => item.trim());
}

export function extractMockEventsFromText(
  text: string,
  sourceFileId: string,
): ExtractedAcademicEventInput[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 2)
    .filter((line) => !/^(data|date|data da|título|titulo|evento|atividade)\b/i.test(line))
    .map((line) => {
      const columns = splitStructuredLine(line);
      const dateValue = columns.find((column) =>
        /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}/.test(column),
      );
      const startsAt = parseDate(dateValue);
      const title =
        columns.find((column) => column !== dateValue && !/^\d+(,\d+)?%?$/.test(column)) ?? line;
      const subjectName =
        columns.find(
          (column, index) =>
            index > 0 &&
            column !== dateValue &&
            column !== title &&
            !/^(prova|trabalho|aula|fórum|forum)$/i.test(column),
        ) ?? "Sem disciplina";
      const eventType = classifyEventType(line);
      const confidenceScore = Math.min(
        100,
        55 +
          (startsAt ? 25 : 0) +
          (title.length > 4 ? 10 : 0) +
          (subjectName !== "Sem disciplina" ? 10 : 0),
      );
      const weightValue = columns.find((column) => /^\d+(,\d+)?%?$/.test(column));

      return {
        sourceFileId,
        title: title.slice(0, 160),
        subjectName,
        eventType,
        startsAt,
        confidenceScore,
        weight: weightValue ? Number(weightValue.replace("%", "").replace(",", ".")) : null,
        evidence: line.slice(0, 2000),
      };
    });
}

export async function importAcademicFile(
  file: File,
  sourceFileId = crypto.randomUUID(),
): Promise<ImportFileResult> {
  const extraction = await extractTextFromFile(file);
  return {
    ...extraction,
    preview: createImportPreview(extractMockEventsFromText(extraction.text, sourceFileId)),
  };
}
