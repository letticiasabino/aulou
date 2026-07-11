import { z } from "zod";

const attributedPointSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  sourceFileId: z.string().nullable(),
});

export const aiSummarySchema = z.object({
  overview: z.string().trim().min(1).max(4000),
  extractedInformation: z.array(attributedPointSchema).max(30),
  keyPoints: z.array(attributedPointSchema).max(30),
  uncertainties: z.array(z.string().max(500)).max(20),
  studyRecommendations: z.array(z.string().max(500)).max(20),
  sourceFileIds: z.array(z.string()).max(20),
});

export const tutorResponseSchema = z.object({
  answer: z.string().trim().min(1).max(6000),
  extractedInformation: z.array(attributedPointSchema).max(20),
  inferences: z.array(z.string().max(1000)).max(20),
  recommendations: z.array(z.string().max(1000)).max(20),
  missingInformation: z.array(z.string().max(500)).max(20),
  sourceFileIds: z.array(z.string()).max(20),
});

export type AISummary = z.infer<typeof aiSummarySchema>;
export type TutorResponse = z.infer<typeof tutorResponseSchema>;
