import { describe, expect, it } from "vitest";
import { generateFlashcardsFromText } from "@/engines/flashcard-engine";

describe("FlashcardEngine", () => {
  it("gera cartões sem alterar o conteúdo da explicação", () => {
    const cards = generateFlashcardsFromText(
      "Fotossíntese: processo de conversão de luz em energia. Mitose: divisão celular.",
      "deck_1",
      "user_1",
      "Biologia",
      undefined,
      new Date("2026-07-11T00:00:00.000Z"),
    );
    expect(cards).toHaveLength(2);
    expect(cards[0]?.front).toBe("Fotossíntese");
    expect(cards[0]?.back).toContain("conversão de luz");
    expect(cards[0]?.nextReviewAt).toBe("2026-07-11T00:00:00.000Z");
  });
});
