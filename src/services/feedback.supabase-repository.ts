import { createClient } from "@/lib/supabase/client";
import type { FeedbackRecord } from "@/services/feedback.service";

export const supabaseFeedbackRepository = {
  async create(userId: string, feedback: FeedbackRecord, pageUrl: string | null, userAgent: string | null) {
    const result = await createClient().from("feedback").insert({
      id: feedback.id,
      user_id: userId,
      category: feedback.category === "idea" ? "suggestion" : feedback.category,
      message: feedback.message,
      rating: feedback.rating,
      page_url: pageUrl,
      user_agent: userAgent,
      status: "new",
    });
    if (result.error) throw new Error("Não foi possível persistir o feedback.");
    return feedback;
  },
};
