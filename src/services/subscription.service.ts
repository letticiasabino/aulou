import { PLAN_DEFINITIONS } from "@/config/plans";
import { getLimitForFeature } from "@/engines/monetization-engine";
import { paymentService } from "@/services/payment.service";
import type { BillingCycle, PlanCode, Subscription, UsageCounters } from "@/types/academic";
import { analyticsService } from "@/services/analytics.service";

const subscriptionKey = "aulou.subscription";
const usageKey = "aulou.usage";
const initialUsage: UsageCounters = { uploads: 0, aiCredits: 0, flashcards: 0, quizzes: 0 };

function readSubscription(userId: string): Subscription {
  if (typeof window === "undefined")
    return {
      id: "local-free",
      userId,
      plan: "free",
      status: "active",
      billingCycle: "monthly",
      provider: "mock",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  const saved = JSON.parse(
    window.localStorage.getItem(`${subscriptionKey}:${userId}`) ?? "null",
  ) as Subscription | null;
  return (
    saved ?? {
      id: "local-free",
      userId,
      plan: "free",
      status: "active",
      billingCycle: "monthly",
      provider: "mock",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

export const subscriptionService = {
  async get(userId: string) {
    return readSubscription(userId);
  },
  async getUsage(userId: string) {
    if (typeof window === "undefined") return initialUsage;
    return {
      ...initialUsage,
      ...(JSON.parse(
        window.localStorage.getItem(`${usageKey}:${userId}`) ?? "{}",
      ) as Partial<UsageCounters>),
    };
  },
  async startCheckout(userId: string, plan: PlanCode, billingCycle: BillingCycle) {
    analyticsService.identify(userId);
    analyticsService.track("upgrade_clicked", {
      userId,
      target_plan: plan,
      billing_cycle: billingCycle,
    });
    const result = await paymentService.startCheckout(plan, billingCycle, userId);
    if (result.subscription && typeof window !== "undefined")
      window.localStorage.setItem(
        `${subscriptionKey}:${userId}`,
        JSON.stringify(result.subscription),
      );
    const subscription = result.subscription ?? readSubscription(userId);
    if (subscription.plan !== "free")
      analyticsService.track("subscription_completed", {
        userId,
        plan: subscription.plan,
        billing_cycle: billingCycle,
      });
    return subscription;
  },
  async incrementUsage(userId: string, resource: keyof UsageCounters) {
    const usage = await this.getUsage(userId);
    const next = { ...usage, [resource]: usage[resource] + 1 };
    if (typeof window !== "undefined")
      window.localStorage.setItem(`${usageKey}:${userId}`, JSON.stringify(next));
    const subscription = await this.get(userId);
    const resourceToLimit = {
      uploads: "uploadsPerMonth",
      aiCredits: "aiCreditsPerMonth",
      flashcards: "flashcardsPerMonth",
      quizzes: "quizzesPerMonth",
    } as const;
    const limit = getLimitForFeature(subscription.plan, resourceToLimit[resource]);
    if (typeof limit === "number" && next[resource] >= limit)
      analyticsService.track("limit_reached", { userId, resource, plan: subscription.plan });
    return next;
  },
  getPlanDefinition(plan: PlanCode) {
    return PLAN_DEFINITIONS[plan];
  },
};
