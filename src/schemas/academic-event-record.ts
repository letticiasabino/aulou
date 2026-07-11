import { z } from "zod";
import { academicEventTypeSchema } from "@/schemas/academic-event";

export const academicEventRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  sourceFileId: z.string().uuid().nullable(),
  title: z.string().trim().min(1).max(160),
  description: z.string().max(2000).optional(),
  subjectName: z.string().trim().min(1).max(160),
  eventType: academicEventTypeSchema,
  startsAt: z.string().datetime().nullable(),
  endsAt: z.string().datetime().nullable(),
  isAllDay: z.boolean(),
  weight: z.number().min(0).max(100).nullable(),
  confidenceScore: z.number().min(0).max(100),
  confidenceLabel: z.enum(["needs_review", "probable", "high_confidence"]),
  reviewStatus: z.literal("confirmed"),
  priority: z.enum(["low", "medium", "high", "maximum"]),
  evidence: z.string().max(2000).optional(),
  reviewReasons: z.array(z.string()),
  dedupeKey: z.string().min(1).max(500),
  confirmedAt: z.string().datetime(),
});

export type AcademicEventRecordInput = z.input<typeof academicEventRecordSchema>;
