import { isSupabaseConfigured } from "@/lib/supabase/client";
import { generateFlashcardsFromText } from "@/engines/flashcard-engine";
import { isDue, scheduleFlashcardReview } from "@/engines/review-engine";
import { supabaseFlashcardsRepository } from "@/services/flashcards.supabase-repository";
import type { Flashcard, FlashcardDeck, FlashcardRating, FlashcardReview } from "@/types/academic";

const storageKey = "aulou.flashcards";
type LocalData = { decks: FlashcardDeck[]; cards: Flashcard[]; reviews: FlashcardReview[] };
function readLocal(): LocalData {
  if (typeof window === "undefined") return { decks: [], cards: [], reviews: [] };
  return JSON.parse(
    window.localStorage.getItem(storageKey) ?? '{"decks":[],"cards":[],"reviews":[]}',
  ) as LocalData;
}
function writeLocal(data: LocalData) {
  window.localStorage.setItem(storageKey, JSON.stringify(data));
}
function required(value: string, label: string) {
  const clean = value.trim();
  if (!clean) throw new Error(`${label} é obrigatório.`);
  if (clean.length > 2000) throw new Error(`${label} excede o limite.`);
  return clean;
}

export const flashcardsService = {
  async list(userId: string) {
    if (isSupabaseConfigured()) return supabaseFlashcardsRepository.list(userId);
    const local = readLocal();
    return {
      decks: local.decks.filter((deck) => deck.userId === userId),
      cards: local.cards.filter((card) => card.userId === userId),
    };
  },
  async createDeck(
    userId: string,
    input: { title: string; subjectName: string; description?: string },
  ) {
    const now = new Date().toISOString();
    const deck: FlashcardDeck = {
      id: `deck_${crypto.randomUUID()}`,
      userId,
      title: required(input.title, "Título"),
      subjectName: required(input.subjectName, "Disciplina"),
      description: input.description?.trim(),
      cardCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    if (isSupabaseConfigured()) return supabaseFlashcardsRepository.saveDeck(userId, deck);
    const local = readLocal();
    writeLocal({ ...local, decks: [deck, ...local.decks] });
    return deck;
  },
  async createManualCard(
    userId: string,
    deck: FlashcardDeck,
    input: { front: string; back: string },
  ) {
    const now = new Date();
    const cards = [
      {
        id: `card_${crypto.randomUUID()}`,
        deckId: deck.id,
        userId,
        front: required(input.front, "Frente"),
        back: required(input.back, "Verso"),
        nextReviewAt: now.toISOString(),
        repetitions: 0,
        intervalDays: 0,
        easeFactor: 2.5,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];
    await this.saveCards(userId, deck, cards);
    return cards[0]!;
  },
  async generateFromText(userId: string, deck: FlashcardDeck, text: string, sourceFileId?: string) {
    const cards = generateFlashcardsFromText(
      required(text, "Material"),
      deck.id,
      userId,
      deck.subjectName,
      sourceFileId,
    );
    await this.saveCards(userId, deck, cards);
    return cards;
  },
  async saveCards(userId: string, deck: FlashcardDeck, cards: Flashcard[]) {
    if (isSupabaseConfigured()) {
      await supabaseFlashcardsRepository.saveDeck(userId, {
        ...deck,
        cardCount: deck.cardCount + cards.length,
        updatedAt: new Date().toISOString(),
      });
      return supabaseFlashcardsRepository.saveCards(userId, cards);
    }
    const local = readLocal();
    const existing = new Set(local.cards.map((card) => card.id));
    const nextCards = [...local.cards, ...cards.filter((card) => !existing.has(card.id))];
    const nextDeck = {
      ...deck,
      cardCount: nextCards.filter((card) => card.deckId === deck.id).length,
      updatedAt: new Date().toISOString(),
    };
    writeLocal({
      decks: local.decks.map((item) => (item.id === deck.id ? nextDeck : item)),
      cards: nextCards,
      reviews: local.reviews,
    });
    return cards;
  },
  async review(userId: string, card: Flashcard, rating: FlashcardRating, reviewedAt = new Date()) {
    const nextCard = scheduleFlashcardReview(card, rating, reviewedAt);
    const review: FlashcardReview = {
      id: `review_${crypto.randomUUID()}`,
      flashcardId: card.id,
      userId,
      rating,
      reviewedAt: reviewedAt.toISOString(),
      previousIntervalDays: card.intervalDays,
      nextIntervalDays: nextCard.intervalDays,
    };
    if (isSupabaseConfigured()) {
      await supabaseFlashcardsRepository.updateCard(userId, nextCard);
      await supabaseFlashcardsRepository.saveReview(userId, review);
      return nextCard;
    }
    const local = readLocal();
    writeLocal({
      decks: local.decks,
      cards: local.cards.map((item) => (item.id === card.id ? nextCard : item)),
      reviews: [review, ...local.reviews],
    });
    return nextCard;
  },
  isDue,
};
