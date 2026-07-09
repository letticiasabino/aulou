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
}

export interface PlanLimit {
  uploadsPerMonth: number;
  aiCreditsPerMonth: number;
  flashcardsPerMonth: number;
  quizzesPerMonth: number;
  priorityProcessing: boolean;
}

export type PlanCode = "free" | "plus" | "pro";
