import { describe, expect, it } from "vitest";
import {
  buildAIContext,
  serializeAIContext,
  validateAIReferences,
} from "@/engines/ai-context-engine";

describe("AIContextEngine", () => {
  it("preserva referencias e separa o contexto sem incluir userId", () => {
    const context = buildAIContext({
      events: [
        {
          id: "event_1",
          title: "Prova",
          subjectName: "Cálculo",
          startsAt: null,
          sourceFileId: "file_1",
        },
      ],
      files: [{ id: "file_1", name: "cronograma.pdf", extractedText: "Data: 10/08" }],
      question: "Quando é a prova?",
    });

    expect(context.extractedInformation.events[0]?.sourceFileId).toBe("file_1");
    expect(context.extractedInformation.files[0]?.extractedText).toBe("Data: 10/08");
    expect(serializeAIContext(context)).not.toContain("userId");
  });

  it("limita material para evitar contexto sem limite", () => {
    const context = buildAIContext({ events: [], files: [], materialText: "x".repeat(30000) });
    expect(context.extractedInformation.materialText).toHaveLength(20000);
  });

  it("rejeita referencia de arquivo que nao esta no contexto", () => {
    const context = buildAIContext({ events: [], files: [{ id: "file_1", name: "a.pdf" }] });
    expect(() => validateAIReferences({ sourceFileIds: ["file_2"] }, context)).toThrow(
      "fora do contexto",
    );
    expect(() => validateAIReferences({ sourceFileIds: ["file_1"] }, context)).not.toThrow();
  });
});
