import { feedbackSchema, type FeedbackInput } from "@/schemas/feedback";
import { analyticsService } from "@/services/analytics.service";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { supabaseFeedbackRepository } from "@/services/feedback.supabase-repository";

export interface FeedbackRecord extends FeedbackInput {
  id: string;
  userId: string;
  createdAt: string;
}

const storageKey = "aulou.feedback";

export const feedbackService = {
  async submit(userId: string, input: FeedbackInput) {
    const validated = feedbackSchema.parse(input);
    const rate = checkRateLimit(`feedback:${userId}`, 5, 10 * 60_000);
    if (!rate.allowed) throw new Error("Você atingiu o limite de feedbacks. Tente novamente mais tarde.");
    const record: FeedbackRecord = {
      ...validated,
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
    };
    if (isSupabaseConfigured()) {
      await supabaseFeedbackRepository.create(userId, record, typeof window !== "undefined" ? window.location.href : null, typeof navigator !== "undefined" ? navigator.userAgent : null);
    }
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
