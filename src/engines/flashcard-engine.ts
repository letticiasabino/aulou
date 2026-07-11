import type { Flashcard } from "@/types/academic";

export function generateFlashcardsFromText(
  text: string,
  deckId: string,
  userId: string,
  subjectName: string,
  sourceFileId?: string,
  now = new Date(),
): Flashcard[] {
  return text
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 8)
    .slice(0, 100)
    .map((line, index) => {
      const separator = line.indexOf(":");
      const front =
        separator > 0 ? line.slice(0, separator).trim() : "Qual é a ideia principal deste trecho?";
      const back = separator > 0 ? line.slice(separator + 1).trim() : line;
      const timestamp = now.toISOString();
      return {
        id: `card_${deckId}_${index + 1}`,
        deckId,
        userId,
        front,
        back,
        sourceFileId,
        nextReviewAt: timestamp,
        repetitions: 0,
        intervalDays: 0,
        easeFactor: 2.5,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });
}
