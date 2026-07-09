import type { PlanCode } from "@/types/academic";

export const paymentService = {
  async startCheckout(plan: PlanCode) {
    return {
      plan,
      status: "mock_checkout_ready" as const,
    };
  },
};
