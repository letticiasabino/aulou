import type { BillingCycle, PlanCode, Subscription } from "@/types/academic";

export interface CheckoutResult {
  status: "mock_checkout_ready" | "completed";
  plan: PlanCode;
  billingCycle: BillingCycle;
  subscription?: Subscription;
}

export const paymentService = {
  async startCheckout(
    plan: PlanCode,
    billingCycle: BillingCycle = "monthly",
    userId = "guest",
  ): Promise<CheckoutResult> {
    if (plan === "free") return { plan, billingCycle, status: "completed" };
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + (billingCycle === "yearly" ? 12 : 1));
    return {
      plan,
      billingCycle,
      status: "completed",
      subscription: {
        id: crypto.randomUUID(),
        userId,
        plan,
        status: "active",
        billingCycle,
        currentPeriodEndsAt: end.toISOString(),
        provider: "mock",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    };
  },
};
