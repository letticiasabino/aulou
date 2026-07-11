import { describe, expect, it } from "vitest";
import { confirmAcademicEvent, filterAcademicEvents } from "@/engines/calendar-engine";
import { normalizeExtractedEvent } from "@/engines/import-engine";

describe("CalendarEngine filters", () => {
  it("filtra e ordena por disciplina, tipo e data", () => {
    const events = [
      confirmAcademicEvent(
        normalizeExtractedEvent({
          sourceFileId: "file_1",
          title: "Prova",
          subjectName: "Cálculo",
          eventType: "exam",
          startsAt: "2026-08-10T00:00:00.000Z",
          confidenceScore: 99,
        }),
        "user_1",
      ),
      confirmAcademicEvent(
        normalizeExtractedEvent({
          sourceFileId: "file_1",
          title: "Trabalho",
          subjectName: "Cálculo",
          eventType: "assignment",
          startsAt: "2026-08-05T00:00:00.000Z",
          confidenceScore: 99,
        }),
        "user_1",
      ),
    ];

    const filtered = filterAcademicEvents(events, {
      subjectName: "Cálculo",
      eventType: "exam",
      from: "2026-08-01",
      to: "2026-08-31",
    });
    expect(filtered.map((event) => event.title)).toEqual(["Prova"]);
  });
});
