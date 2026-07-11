import { describe, expect, it } from "vitest";
import { aiSummarySchema, tutorResponseSchema } from "@/services/ai/ai-contracts";

describe("AI contracts", () => {
  it("aceita resposta separada por fatos, incertezas e recomendações", () => {
    expect(
      aiSummarySchema.parse({
        overview: "Resumo",
        extractedInformation: [],
        keyPoints: [],
        uncertainties: ["Data ausente"],
        studyRecommendations: ["Revisar"],
        sourceFileIds: ["file_1"],
      }).overview,
    ).toBe("Resumo");
    expect(
      tutorResponseSchema.parse({
        answer: "Não há informação suficiente.",
        extractedInformation: [],
        inferences: [],
        recommendations: [],
        missingInformation: ["Peso da prova"],
        sourceFileIds: [],
      }).answer,
    ).toContain("suficiente");
  });

  it("rejeita saída sem resposta ou com fato sem referência", () => {
    expect(() =>
      tutorResponseSchema.parse({
        answer: "",
        extractedInformation: [],
        inferences: [],
        recommendations: [],
        missingInformation: [],
        sourceFileIds: [],
      }),
    ).toThrow();
    expect(() =>
      aiSummarySchema.parse({
        overview: "Resumo",
        extractedInformation: [{ text: "Fato" }],
        keyPoints: [],
        uncertainties: [],
        studyRecommendations: [],
        sourceFileIds: [],
      }),
    ).toThrow();
  });
});
