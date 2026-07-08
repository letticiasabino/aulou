export type FlashcardRating = "again" | "hard" | "good" | "easy";

const intervalByRating: Record<FlashcardRating, number> = {
  again: 1,
  hard: 2,
  good: 4,
  easy: 7,
};

export function nextReviewAt(rating: FlashcardRating, reviewedAt = new Date()) {
  const next = new Date(reviewedAt);
  next.setDate(next.getDate() + intervalByRating[rating]);
  return next.toISOString();
}
