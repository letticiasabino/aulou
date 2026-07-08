import { describe, expect, it } from "vitest";
import { confirmAcademicEvent, detectConflicts } from "@/engines/calendar-engine";
import { normalizeExtractedEvent } from "@/engines/import-engine";

describe("CalendarEngine", () => {
  it("detecta conflito de horário", () => {
    const existing = confirmAcademicEvent(
      normalizeExtractedEvent({
        sourceFileId: "file_1",
        title: "Aula",
        subjectName: "História",
        eventType: "class",
        startsAt: "2026-08-01T18:00:00.000Z",
        endsAt: "2026-08-01T20:00:00.000Z",
        confidenceScore: 99,
      }),
      "user_1",
    );

    const candidate = normalizeExtractedEvent({
      sourceFileId: "file_2",
      title: "Prova",
      subjectName: "História",
      eventType: "exam",
      startsAt: "2026-08-01T19:00:00.000Z",
      endsAt: "2026-08-01T21:00:00.000Z",
      confidenceScore: 99,
    });

    expect(detectConflicts([existing], candidate)).toHaveLength(1);
  });
});
