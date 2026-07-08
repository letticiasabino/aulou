import { describe, expect, it } from "vitest";
import { createImportPreview, labelConfidence, normalizeExtractedEvent } from "@/engines/import-engine";

describe("ImportEngine", () => {
  it("classifica confiança conforme regra de negócio", () => {
    expect(labelConfidence(79)).toBe("needs_review");
    expect(labelConfidence(80)).toBe("probable");
    expect(labelConfidence(94)).toBe("probable");
    expect(labelConfidence(95)).toBe("high_confidence");
  });

  it("marca revisão quando data é ambígua e disciplina não foi identificada", () => {
    const event = normalizeExtractedEvent({
      sourceFileId: "file_1",
      title: "Prova 1",
      subjectName: "Sem disciplina",
      eventType: "exam",
      startsAt: null,
      confidenceScore: 72,
    });

    expect(event.reviewReasons).toContain("Data ausente ou ambígua.");
    expect(event.reviewReasons).toContain("Disciplina não identificada.");
    expect(event.reviewReasons).toContain("Confiança abaixo de 80%.");
    expect(event.priority).toBe("maximum");
  });

  it("detecta duplicidades dentro do preview", () => {
    const preview = createImportPreview([
      {
        sourceFileId: "file_1",
        title: "Trabalho final",
        subjectName: "Cálculo",
        eventType: "assignment",
        startsAt: "2026-08-10T23:59:00.000Z",
        confidenceScore: 92,
      },
      {
        sourceFileId: "file_2",
        title: "Trabalho final",
        subjectName: "Calculo",
        eventType: "assignment",
        startsAt: "2026-08-10T23:59:00.000Z",
        confidenceScore: 96,
      },
    ]);

    expect(preview.summary.duplicates).toBe(1);
    expect(preview.events[1]?.reviewReasons).toContain("Possível duplicidade na importação.");
  });
});
