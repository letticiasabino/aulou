import { describe, expect, it } from "vitest";
import {
  createImportPreview,
  extractMockEventsFromText,
  importAcademicFile,
  labelConfidence,
  normalizeExtractedEvent,
  validateImportPreviewEvents,
} from "@/engines/import-engine";

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

  it("estrutura linhas de cronograma em eventos sem inventar data ausente", () => {
    const events = extractMockEventsFromText(
      "Data;Evento;Disciplina\n10/08/2026;Prova 1;Cálculo\nTrabalho final;Programação",
      "file_1",
    );

    expect(events).toHaveLength(2);
    expect(events[0]?.eventType).toBe("exam");
    expect(events[0]?.startsAt).toContain("2026-08-10");
    expect(events[1]?.startsAt).toBeNull();
  });

  it("faz extração real de texto e retorna preview validado", async () => {
    const file = new File(["10/08/2026;Prova de cálculo;Cálculo"], "cronograma.csv", {
      type: "text/csv",
    });
    const result = await importAcademicFile(file, "file_1");

    expect(result.source).toBe("file");
    expect(result.preview.summary.total).toBe(1);
    expect(result.preview.events[0]?.sourceFileId).toBe("file_1");
  });

  it("não inventa eventos para formatos binários ainda não processados", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "cronograma.pdf", {
      type: "application/pdf",
    });
    const result = await importAcademicFile(file, "file_2");

    expect(result.source).toBe("mock");
    expect(result.preview.summary.total).toBe(0);
    expect(result.message).toContain("próxima etapa");
  });

  it("valida novamente os campos editados no preview com Zod", () => {
    const preview = createImportPreview([
      {
        sourceFileId: "file_1",
        title: "Prova",
        subjectName: "Cálculo",
        eventType: "exam",
        startsAt: null,
        confidenceScore: 72,
      },
    ]);

    expect(() => validateImportPreviewEvents(preview.events)).not.toThrow();
    expect(() => validateImportPreviewEvents([{ ...preview.events[0]!, title: "" }])).toThrow();
  });
});
