import { describe, expect, it } from "vitest";
import { feedbackSchema } from "@/schemas/feedback";

describe("feedbackSchema", () => {
  it("aceita feedback válido", () => {
    expect(
      feedbackSchema.parse({
        category: "idea",
        rating: 5,
        message: "Gostei muito do fluxo de importação.",
      }).rating,
    ).toBe(5);
  });
  it("rejeita mensagem curta e nota fora do intervalo", () => {
    expect(feedbackSchema.safeParse({ category: "bug", rating: 6, message: "curto" }).success).toBe(
      false,
    );
  });
});
