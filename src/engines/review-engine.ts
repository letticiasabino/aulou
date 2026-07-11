import type { Flashcard, FlashcardRating } from "@/types/academic";

const intervalByRating: Record<FlashcardRating, number> = { again: 1, hard: 2, good: 4, easy: 7 };

export function nextReviewAt(rating: FlashcardRating, reviewedAt = new Date()) {
  const next = new Date(reviewedAt);
  next.setDate(next.getDate() + intervalByRating[rating]);
  return next.toISOString();
}
export function nextIntervalDays(
  card: Pick<Flashcard, "repetitions" | "intervalDays" | "easeFactor">,
  rating: FlashcardRating,
) {
  if (rating === "again") return 1;
  if (rating === "hard") return Math.max(1, Math.round(Math.max(1, card.intervalDays) * 1.2));
  if (rating === "easy") return Math.max(4, Math.round(Math.max(1, card.intervalDays) * 3.5));
  return card.repetitions === 0
    ? 1
    : Math.max(2, Math.round(Math.max(1, card.intervalDays) * Math.max(1.8, card.easeFactor)));
}
export function scheduleFlashcardReview(
  card: Flashcard,
  rating: FlashcardRating,
  reviewedAt = new Date(),
): Flashcard {
  const intervalDays = nextIntervalDays(card, rating);
  const easeFactor =
    rating === "again"
      ? Math.max(1.3, card.easeFactor - 0.2)
      : rating === "easy"
        ? card.easeFactor + 0.15
        : rating === "hard"
          ? Math.max(1.3, card.easeFactor - 0.05)
          : card.easeFactor;
  const next = new Date(reviewedAt);
  next.setDate(next.getDate() + intervalDays);
  return {
    ...card,
    repetitions: rating === "again" ? 0 : card.repetitions + 1,
    intervalDays,
    easeFactor,
    lastReviewedAt: reviewedAt.toISOString(),
    nextReviewAt: next.toISOString(),
    updatedAt: reviewedAt.toISOString(),
  };
}
export function isDue(card: Pick<Flashcard, "nextReviewAt">, now = new Date()) {
  return new Date(card.nextReviewAt).getTime() <= now.getTime();
}
