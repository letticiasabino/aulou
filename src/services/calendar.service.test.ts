import { beforeEach, describe, expect, it } from "vitest";
import { calendarService } from "@/services/calendar.service";

describe("calendarService", () => {
  beforeEach(() => window.localStorage.clear());

  it("salva importados somente pelo fluxo de confirmação", async () => {
    const event = {
      id: "4f9b2d2a-9828-4c3b-83cd-3bd9e4622a01",
      sourceFileId: "file_1",
      title: "Prova de Cálculo",
      subjectName: "Cálculo",
      eventType: "exam" as const,
      startsAt: "2026-08-10T00:00:00.000Z",
      endsAt: null,
      isAllDay: true,
      weight: null,
      confidenceScore: 92,
      confidenceLabel: "probable" as const,
      reviewStatus: "pending_review" as const,
      priority: "maximum" as const,
      reviewReasons: [],
      dedupeKey: "calculo|exam|2026-08-10|prova de calculo",
    };

    await calendarService.confirmImportedEvents("user_1", [event]);
    const events = await calendarService.listEvents("user_1", { eventType: "exam" });
    expect(events).toHaveLength(1);
    expect(events[0]?.reviewStatus).toBe("confirmed");
  });

  it("cria e edita evento manual no fallback local", async () => {
    const created = await calendarService.createManualEvent("user_1", {
      title: "Aula",
      subjectName: "História",
      eventType: "class",
      startsAt: null,
      endsAt: null,
      isAllDay: true,
      weight: null,
    });
    const updated = await calendarService.updateEvent("user_1", {
      ...created,
      title: "Aula inaugural",
    });
    expect(updated.title).toBe("Aula inaugural");
  });
});
