import { z } from "zod";

export const academicEventTypeSchema = z.enum([
  "class",
  "exam",
  "assignment",
  "forum",
  "reading",
  "study",
  "other",
]);

export const extractedAcademicEventInputSchema = z.object({
  id: z.string().optional(),
  sourceFileId: z.string().min(1),
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  subjectName: z.string().trim().min(1).default("Sem disciplina"),
  eventType: academicEventTypeSchema.default("other"),
  startsAt: z.string().datetime().nullable(),
  endsAt: z.string().datetime().nullable().optional(),
  isAllDay: z.boolean().optional(),
  weight: z.number().min(0).max(100).nullable().optional(),
  confidenceScore: z.number().min(0).max(100),
  evidence: z.string().max(2000).optional(),
  reviewReasons: z.array(z.string()).default([]),
});

export type ExtractedAcademicEventInput = z.input<typeof extractedAcademicEventInputSchema>;
export type ParsedExtractedAcademicEventInput = z.output<typeof extractedAcademicEventInputSchema>;
