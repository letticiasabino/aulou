import { describe, expect, it } from "vitest";
import { isDue, scheduleFlashcardReview } from "@/engines/review-engine";
import type { Flashcard } from "@/types/academic";

const card: Flashcard = {
  id: "card_1",
  deckId: "deck_1",
  userId: "user_1",
  front: "O que é X?",
  back: "X",
  nextReviewAt: "2026-07-11T00:00:00.000Z",
  repetitions: 1,
  intervalDays: 4,
  easeFactor: 2.5,
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

describe("ReviewEngine", () => {
  it("aumenta intervalo quando a resposta é boa e reduz quando é difícil", () => {
    expect(
      scheduleFlashcardReview(card, "good", new Date("2026-07-11T00:00:00.000Z")).intervalDays,
    ).toBeGreaterThan(card.intervalDays);
    expect(
      scheduleFlashcardReview(card, "again", new Date("2026-07-11T00:00:00.000Z")).intervalDays,
    ).toBe(1);
  });

  it("identifica cartão vencido", () => {
    expect(isDue(card, new Date("2026-07-12T00:00:00.000Z"))).toBe(true);
    expect(isDue(card, new Date("2026-07-10T00:00:00.000Z"))).toBe(false);
  });
});
