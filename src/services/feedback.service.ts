import { feedbackSchema, type FeedbackInput } from "@/schemas/feedback";
import { analyticsService } from "@/services/analytics.service";

export interface FeedbackRecord extends FeedbackInput {
  id: string;
  userId: string;
  createdAt: string;
}

const storageKey = "studypilot.feedback";

export const feedbackService = {
  async submit(userId: string, input: FeedbackInput) {
    const validated = feedbackSchema.parse(input);
    const record: FeedbackRecord = {
      ...validated,
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      const current = JSON.parse(
        window.localStorage.getItem(storageKey) ?? "[]",
      ) as FeedbackRecord[];
      window.localStorage.setItem(storageKey, JSON.stringify([...current, record].slice(-100)));
    }
    analyticsService.identify(userId);
    analyticsService.track("feedback_submitted", {
      userId,
      category: validated.category,
      rating: validated.rating,
    });
    return record;
  },
};
