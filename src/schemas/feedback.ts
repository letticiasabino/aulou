import { z } from "zod";

export const feedbackSchema = z.object({
  category: z.enum(["bug", "idea", "experience", "other"]),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(10, "Conte um pouco mais para nos ajudar.").max(2000),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
