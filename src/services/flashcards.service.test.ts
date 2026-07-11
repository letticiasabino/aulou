import { beforeEach, describe, expect, it } from "vitest";
import { flashcardsService } from "@/services/flashcards.service";

describe("flashcardsService", () => {
  beforeEach(() => window.localStorage.clear());

  it("cria baralho, gera cards e registra revisão local", async () => {
    const deck = await flashcardsService.createDeck("user_1", {
      title: "Biologia",
      subjectName: "Biologia",
    });
    const cards = await flashcardsService.generateFromText(
      "Célula: unidade básica dos seres vivos.",
      deck,
      "Célula: unidade básica dos seres vivos.",
    );
    expect(cards).toHaveLength(1);
    const reviewed = await flashcardsService.review(
      "user_1",
      cards[0]!,
      "good",
      new Date("2026-07-11T00:00:00.000Z"),
    );
    expect(reviewed.repetitions).toBe(1);
    expect((await flashcardsService.list("user_1")).decks[0]?.cardCount).toBe(1);
  });
});
