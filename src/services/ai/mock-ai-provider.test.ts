import { describe, expect, it } from "vitest";
import { MockAIProvider } from "@/services/ai/mock-ai-provider";
import { aiSummarySchema, tutorResponseSchema } from "@/services/ai/ai-contracts";

describe("MockAIProvider", () => {
  it("declara falta de contexto em vez de inventar um resumo", async () => {
    const result = await new MockAIProvider().runStructured({
      task: "summarize_material",
      userId: "user_1",
      input: { materialText: "" },
    });
    const summary = aiSummarySchema.parse(result.output);
    expect(summary.uncertainties).toHaveLength(1);
    expect(summary.sourceFileIds).toEqual([]);
  });

  it("mantém tutor seguro no fallback local", async () => {
    const result = await new MockAIProvider().runStructured({
      task: "tutor_message",
      userId: "user_1",
      input: { question: "Qual o peso?" },
    });
    const response = tutorResponseSchema.parse(result.output);
    expect(response.missingInformation.length).toBeGreaterThan(0);
    expect(response.sourceFileIds).toEqual([]);
  });
});
