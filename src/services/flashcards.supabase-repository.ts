import { createClient } from "@/lib/supabase/client";
import type { Flashcard, FlashcardDeck, FlashcardReview } from "@/types/academic";
import type { FlashcardDeckRow, FlashcardRow } from "@/types/database.types";

function assertResult(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}
function mapDeck(row: FlashcardDeckRow): FlashcardDeck {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    subjectName: row.subject_name,
    description: row.description ?? undefined,
    cardCount: row.card_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
function mapCard(row: FlashcardRow): Flashcard {
  return {
    id: row.id,
    deckId: row.deck_id,
    userId: row.user_id,
    front: row.front,
    back: row.back,
    sourceFileId: row.source_file_id ?? undefined,
    nextReviewAt: row.next_review_at,
    repetitions: row.repetitions,
    intervalDays: row.interval_days,
    easeFactor: row.ease_factor,
    lastReviewedAt: row.last_reviewed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const supabaseFlashcardsRepository = {
  async list(userId: string) {
    const supabase = createClient();
    const [decksResult, cardsResult] = await Promise.all([
      supabase
        .from("flashcard_decks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase.from("flashcards").select("*").eq("user_id", userId).order("next_review_at"),
    ]);
    assertResult(decksResult.error, "Não foi possível carregar os baralhos.");
    assertResult(cardsResult.error, "Não foi possível carregar os flashcards.");
    return {
      decks: (decksResult.data ?? []).map(mapDeck),
      cards: (cardsResult.data ?? []).map(mapCard),
    };
  },
  async saveDeck(userId: string, deck: FlashcardDeck) {
    const supabase = createClient();
    const result = await supabase.from("flashcard_decks").upsert(
      {
        id: deck.id,
        user_id: userId,
        title: deck.title,
        subject_name: deck.subjectName,
        description: deck.description ?? null,
        card_count: deck.cardCount,
      },
      { onConflict: "id" },
    );
    assertResult(result.error, "Não foi possível salvar o baralho.");
    return deck;
  },
  async saveCards(userId: string, cards: Flashcard[]) {
    if (!cards.length) return cards;
    const supabase = createClient();
    const result = await supabase.from("flashcards").upsert(
      cards.map((card) => ({
        id: card.id,
        deck_id: card.deckId,
        user_id: userId,
        front: card.front,
        back: card.back,
        source_file_id: card.sourceFileId ?? null,
        next_review_at: card.nextReviewAt,
        repetitions: card.repetitions,
        interval_days: card.intervalDays,
        ease_factor: card.easeFactor,
        last_reviewed_at: card.lastReviewedAt ?? null,
      })),
      { onConflict: "id" },
    );
    assertResult(result.error, "Não foi possível salvar os flashcards.");
    return cards;
  },
  async saveReview(userId: string, review: FlashcardReview) {
    const supabase = createClient();
    const result = await supabase.from("flashcard_reviews").insert({
      id: review.id,
      flashcard_id: review.flashcardId,
      user_id: userId,
      rating: review.rating,
      reviewed_at: review.reviewedAt,
      previous_interval_days: review.previousIntervalDays,
      next_interval_days: review.nextIntervalDays,
    });
    assertResult(result.error, "Não foi possível salvar a revisão.");
  },
  async updateCard(userId: string, card: Flashcard) {
    return this.saveCards(userId, [card]);
  },
};
