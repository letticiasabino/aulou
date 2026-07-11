export type AcademicEventType =
  "class" | "exam" | "assignment" | "forum" | "reading" | "study" | "other";

export type AcademicPriority = "low" | "medium" | "high" | "maximum";

export type ConfidenceLabel = "needs_review" | "probable" | "high_confidence";

export type ReviewStatus = "pending_review" | "confirmed" | "rejected";

export interface ExtractedAcademicEvent {
  id: string;
  sourceFileId: string;
  title: string;
  description?: string;
  subjectName: string;
  eventType: AcademicEventType;
  startsAt: string | null;
  endsAt: string | null;
  isAllDay: boolean;
  weight: number | null;
  confidenceScore: number;
  confidenceLabel: ConfidenceLabel;
  reviewStatus: ReviewStatus;
  priority: AcademicPriority;
  evidence?: string;
  reviewReasons: string[];
  dedupeKey: string;
}

export interface AcademicEvent extends ExtractedAcademicEvent {
  userId: string;
  confirmedAt: string;
}

export interface StudyTask {
  id: string;
  eventId: string;
  title: string;
  dueAt: string;
  estimatedMinutes: number;
  priority: AcademicPriority;
  status: "todo" | "done" | "skipped";
  scheduledFor?: string;
  subjectName?: string;
  eventType?: AcademicEventType;
  overdue?: boolean;
}

export interface StudyDay {
  date: string;
  availableMinutes: number;
  plannedMinutes: number;
  tasks: StudyTask[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  availableMinutesPerDay: number;
  availabilityByWeekday?: Partial<Record<number, number>>;
  tasks: StudyTask[];
  days: StudyDay[];
  unscheduledMinutes?: number;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export type FlashcardRating = "again" | "hard" | "good" | "easy";

export interface FlashcardDeck {
  id: string;
  userId: string;
  title: string;
  subjectName: string;
  description?: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface Flashcard {
  id: string;
  deckId: string;
  userId: string;
  front: string;
  back: string;
  sourceFileId?: string;
  nextReviewAt: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}
export interface FlashcardReview {
  id: string;
  flashcardId: string;
  userId: string;
  rating: FlashcardRating;
  reviewedAt: string;
  previousIntervalDays: number;
  nextIntervalDays: number;
}

export interface PlanLimit {
  uploadsPerMonth: number;
  aiCreditsPerMonth: number;
  flashcardsPerMonth: number;
  quizzesPerMonth: number;
  priorityProcessing: boolean;
}

export type PlanCode = "free" | "plus" | "pro";
